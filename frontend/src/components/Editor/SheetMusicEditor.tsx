import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 乐谱编辑器 - 五线谱/吉他谱/简谱/和弦图

interface Note {
  id: string;
  pitch: string; // C4, D4, E4...
  duration: 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth';
  measure: number;
  beat: number;
  accidental?: 'sharp' | 'flat' | 'natural';
  tied?: boolean;
  dotted?: boolean;
}

interface Chord {
  name: string;
  root: string;
  type: 'major' | 'minor' | 'diminished' | 'augmented' | '7' | 'maj7' | 'min7' | 'dim7' | 'sus2' | 'sus4';
  frets: number[];
  fingers: number[];
  barPosition?: number;
}

interface Measure {
  id: string;
  notes: Note[];
  timeSignature?: [number, number];
  keySignature?: string;
  tempo?: number;
  repeat?: 'start' | 'end' | 'both';
}

interface SheetMusic {
  id: string;
  title: string;
  composer: string;
  timeSignature: [number, number];
  keySignature: string;
  tempo: number;
  measures: Measure[];
  clef: 'treble' | 'bass' | 'alto' | 'tenor';
}

// 吉他和弦库
const CHORD_LIBRARY: Record<string, Chord> = {
  'C': { name: 'C', root: 'C', type: 'major', frets: [0, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'Cm': { name: 'Cm', root: 'C', type: 'minor', frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barPosition: 3 },
  'D': { name: 'D', root: 'D', type: 'major', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  'Dm': { name: 'Dm', root: 'D', type: 'minor', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  'E': { name: 'E', root: 'E', type: 'major', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  'Em': { name: 'Em', root: 'E', type: 'minor', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  'F': { name: 'F', root: 'F', type: 'major', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barPosition: 1 },
  'Fm': { name: 'Fm', root: 'F', type: 'minor', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barPosition: 1 },
  'G': { name: 'G', root: 'G', type: 'major', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  'Gm': { name: 'Gm', root: 'G', type: 'minor', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barPosition: 3 },
  'A': { name: 'A', root: 'A', type: 'major', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'Am': { name: 'Am', root: 'Am', type: 'minor', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  'B': { name: 'B', root: 'B', type: 'major', frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barPosition: 2 },
  'Bm': { name: 'Bm', root: 'B', type: 'minor', frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barPosition: 2 },
  'C7': { name: 'C7', root: 'C', type: '7', frets: [0, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  'D7': { name: 'D7', root: 'D', type: '7', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  'E7': { name: 'E7', root: 'E', type: '7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  'G7': { name: 'G7', root: 'G', type: '7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  'A7': { name: 'A7', root: 'A', type: '7', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0] },
};

// 音符到MIDI映射
const NOTE_TO_MIDI: Record<string, number> = {
  'C3': 48, 'D3': 50, 'E3': 52, 'F3': 53, 'G3': 55, 'A3': 57, 'B3': 59,
  'C4': 60, 'D4': 62, 'E4': 64, 'F4': 65, 'G4': 67, 'A4': 69, 'B4': 71,
  'C5': 72, 'D5': 74, 'E5': 76, 'F5': 77, 'G5': 79, 'A5': 81, 'B5': 83,
  'C6': 84, 'D6': 86, 'E6': 88, 'F6': 89, 'G6': 91, 'A6': 93, 'B6': 95,
};

// 五线谱音符位置映射
const STAFF_POSITIONS: Record<string, number> = {
  'F3': 10, 'G3': 9, 'A3': 8, 'B3': 7,
  'C4': 6, 'D4': 5, 'E4': 4, 'F4': 3, 'G4': 2, 'A4': 1, 'B4': 0,
  'C5': -1, 'D5': -2, 'E5': -3, 'F5': -4, 'G5': -5, 'A5': -6, 'B5': -7,
};

export const useSheetMusic = () => {
  const [sheet, setSheet] = useState<SheetMusic>({
    id: 'sheet-1',
    title: '新乐谱',
    composer: '',
    timeSignature: [4, 4],
    keySignature: 'C',
    tempo: 120,
    measures: [
      { id: 'measure-1', notes: [] },
      { id: 'measure-2', notes: [] },
      { id: 'measure-3', notes: [] },
      { id: 'measure-4', notes: [] },
    ],
    clef: 'treble',
  });
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<'select' | 'note' | 'rest' | 'chord' | 'delete'>('note');
  const [currentDuration, setCurrentDuration] = useState<Note['duration']>('quarter');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);

  const addNote = useCallback((measureIndex: number, beat: number, pitch: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      pitch,
      duration: currentDuration,
      measure: measureIndex,
      beat,
    };

    setSheet(prev => ({
      ...prev,
      measures: prev.measures.map((m, i) =>
        i === measureIndex
          ? { ...m, notes: [...m.notes, newNote] }
          : m
      ),
    }));
  }, [currentDuration]);

  const removeNote = useCallback((noteId: string) => {
    setSheet(prev => ({
      ...prev,
      measures: prev.measures.map(m => ({
        ...m,
        notes: m.notes.filter(n => n.id !== noteId),
      })),
    }));
  }, []);

  const addMeasure = useCallback(() => {
    setSheet(prev => ({
      ...prev,
      measures: [...prev.measures, { id: `measure-${Date.now()}`, notes: [] }],
    }));
  }, []);

  const deleteMeasure = useCallback((measureIndex: number) => {
    if (sheet.measures.length <= 1) return;
    setSheet(prev => ({
      ...prev,
      measures: prev.measures.filter((_, i) => i !== measureIndex),
    }));
  }, [sheet.measures.length]);

  const updateSheetInfo = useCallback((updates: Partial<SheetMusic>) => {
    setSheet(prev => ({ ...prev, ...updates }));
  }, []);

  const playSheet = useCallback(async () => {
    if (!window.AudioContext) return;

    setIsPlaying(true);
    const audioContext = new AudioContext();
    const beatDuration = 60 / sheet.tempo;

    for (let measureIndex = 0; measureIndex < sheet.measures.length; measureIndex++) {
      const measure = sheet.measures[measureIndex];
      setPlaybackPosition(measureIndex);

      for (const note of measure.notes) {
        const frequency = 440 * Math.pow(2, (NOTE_TO_MIDI[note.pitch] - 69) / 12);
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const durationMap: Record<string, number> = {
          whole: 4, half: 2, quarter: 1, eighth: 0.5, sixteenth: 0.25,
        };
        const noteDuration = durationMap[note.duration] * beatDuration;

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + noteDuration);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + noteDuration);

        await new Promise(resolve => setTimeout(resolve, noteDuration * 1000));
      }

      if (measure.notes.length === 0) {
        await new Promise(resolve => setTimeout(resolve, beatDuration * sheet.timeSignature[0] * 1000));
      }
    }

    setIsPlaying(false);
    setPlaybackPosition(0);
  }, [sheet]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setPlaybackPosition(0);
  }, []);

  const exportMusicXML = useCallback(() => {
    // 简化的 MusicXML 导出
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>${sheet.title}</work-title>
  </work>
  <identification>
    <creator type="composer">${sheet.composer}</creator>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Music</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    ${sheet.measures.map((measure, i) => `
    <measure number="${i + 1}">
      ${i === 0 ? `
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>${sheet.timeSignature[0]}</beats><beat-type>${sheet.timeSignature[1]}</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>` : ''}
      ${measure.notes.map(note => `
      <note>
        <pitch>
          <step>${note.pitch[0]}</step>
          <octave>${note.pitch[1]}</octave>
        </pitch>
        <duration>1</duration>
        <type>${note.duration}</type>
      </note>`).join('')}
    </measure>`).join('')}
  </part>
</score-partwise>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sheet.title}.musicxml`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sheet]);

  return {
    sheet,
    selectedNote,
    currentTool,
    currentDuration,
    isPlaying,
    playbackPosition,
    setSelectedNote,
    setCurrentTool,
    setCurrentDuration,
    addNote,
    removeNote,
    addMeasure,
    deleteMeasure,
    updateSheetInfo,
    playSheet,
    stopPlayback,
    exportMusicXML,
  };
};

// 五线谱组件
const StaffNotation: React.FC<{
  sheet: SheetMusic;
  playbackPosition: number;
  onAddNote: (measureIndex: number, beat: number, pitch: string) => void;
  onRemoveNote: (noteId: string) => void;
  currentTool: string;
}> = ({ sheet, playbackPosition, onAddNote, onRemoveNote, currentTool }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{ measure: number; pitch: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const measureWidth = (width - 100) / sheet.measures.length;
    const lineSpacing = 12;
    const staffTop = 80;

    // 清空画布
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // 绘制谱号
    ctx.fillStyle = '#00d4ff';
    ctx.font = '60px serif';
    ctx.fillText('𝄞', 10, staffTop + lineSpacing * 3.5);

    // 绘制调号和拍号
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`${sheet.timeSignature[0]}`, 70, staffTop + lineSpacing * 1.5);
    ctx.fillText(`${sheet.timeSignature[1]}`, 70, staffTop + lineSpacing * 3.5);

    // 绘制小节
    sheet.measures.forEach((measure, measureIndex) => {
      const x = 100 + measureIndex * measureWidth;

      // 绘制五线
      ctx.strokeStyle = measureIndex === playbackPosition ? '#00d4ff' : '#444466';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(x, staffTop + i * lineSpacing);
        ctx.lineTo(x + measureWidth - 10, staffTop + i * lineSpacing);
        ctx.stroke();
      }

      // 绘制小节线
      ctx.strokeStyle = '#666688';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + measureWidth - 10, staffTop);
      ctx.lineTo(x + measureWidth - 10, staffTop + lineSpacing * 4);
      ctx.stroke();

      // 绘制音符
      measure.notes.forEach(note => {
        const position = STAFF_POSITIONS[note.pitch] ?? 0;
        const noteX = x + 30 + (note.beat - 1) * ((measureWidth - 40) / sheet.timeSignature[0]);
        const noteY = staffTop + position * (lineSpacing / 2);

        // 绘制加线
        if (position < 0) {
          ctx.strokeStyle = '#444466';
          ctx.lineWidth = 1;
          for (let i = -2; i >= position; i -= 2) {
            ctx.beginPath();
            ctx.moveTo(noteX - 15, staffTop + i * (lineSpacing / 2));
            ctx.lineTo(noteX + 15, staffTop + i * (lineSpacing / 2));
            ctx.stroke();
          }
        } else if (position > 8) {
          ctx.strokeStyle = '#444466';
          ctx.lineWidth = 1;
          for (let i = 10; i <= position; i += 2) {
            ctx.beginPath();
            ctx.moveTo(noteX - 15, staffTop + i * (lineSpacing / 2));
            ctx.lineTo(noteX + 15, staffTop + i * (lineSpacing / 2));
            ctx.stroke();
          }
        }

        // 绘制符头
        ctx.fillStyle = '#ff6b9d';
        ctx.beginPath();
        ctx.ellipse(noteX, noteY, 8, 6, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // 绘制符杆
        if (note.duration !== 'whole') {
          ctx.strokeStyle = '#ff6b9d';
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (position <= 2) {
            ctx.moveTo(noteX + 7, noteY);
            ctx.lineTo(noteX + 7, noteY + 35);
          } else {
            ctx.moveTo(noteX - 7, noteY);
            ctx.lineTo(noteX - 7, noteY - 35);
          }
          ctx.stroke();
        }

        // 绘制符尾
        if (note.duration === 'eighth' || note.duration === 'sixteenth') {
          ctx.fillStyle = '#ff6b9d';
          const tailX = position <= 2 ? noteX + 7 : noteX - 7;
          const tailY = position <= 2 ? noteY + 35 : noteY - 35;
          const tailDir = position <= 2 ? -1 : 1;

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.quadraticCurveTo(tailX + 15, tailY + tailDir * 10, tailX + 10, tailY + tailDir * 20);
          ctx.stroke();
        }
      });
    });

    // 绘制悬停预览
    if (hoveredPosition && currentTool === 'note') {
      const position = STAFF_POSITIONS[hoveredPosition.pitch] ?? 0;
      const measureX = 100 + hoveredPosition.measure * measureWidth;
      const noteX = measureX + measureWidth / 2;
      const noteY = staffTop + position * (lineSpacing / 2);

      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#00d4ff';
      ctx.beginPath();
      ctx.ellipse(noteX, noteY, 8, 6, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }, [sheet, playbackPosition, hoveredPosition, currentTool]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const measureWidth = (canvas.width - 100) / sheet.measures.length;
    const measureIndex = Math.floor((x - 100) / measureWidth);

    if (measureIndex < 0 || measureIndex >= sheet.measures.length) return;

    const lineSpacing = 12;
    const staffTop = 80;
    const position = Math.round((y - staffTop) / (lineSpacing / 2));

    const pitchMap: Record<number, string> = {};
    Object.entries(STAFF_POSITIONS).forEach(([pitch, pos]) => {
      pitchMap[pos] = pitch;
    });

    const pitch = pitchMap[position];
    if (pitch && currentTool === 'note') {
      onAddNote(measureIndex, 1, pitch);
    }
  }, [sheet.measures.length, currentTool, onAddNote]);

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={200}
      className="w-full bg-slate-900 rounded-xl cursor-crosshair"
      onClick={handleCanvasClick}
    />
  );
};

// 吉他和弦图组件
const GuitarChordDiagram: React.FC<{
  chord: Chord;
  size?: 'small' | 'medium' | 'large';
  onPlay?: () => void;
}> = ({ chord, size = 'medium', onPlay }) => {
  const sizes = {
    small: { width: 80, height: 100, fretHeight: 15, stringSpacing: 12 },
    medium: { width: 120, height: 150, fretHeight: 22, stringSpacing: 18 },
    large: { width: 160, height: 200, fretHeight: 30, stringSpacing: 24 },
  };

  const { width, height, fretHeight, stringSpacing } = sizes[size];
  const nutHeight = 6;
  const startX = 20;
  const startY = 30;

  return (
    <motion.div
      className="inline-block cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onPlay}
    >
      <svg width={width} height={height} className="bg-slate-800 rounded-lg p-2">
        {/* 和弦名称 */}
        <text x={width / 2} y={18} textAnchor="middle" className="fill-white font-bold text-lg">
          {chord.name}
        </text>

        {/* 品位标记 */}
        {chord.barPosition && (
          <text x={10} y={startY + fretHeight} className="fill-gray-400 text-sm">
            {chord.barPosition}
          </text>
        )}

        {/* 琴枕 */}
        {!chord.barPosition && (
          <rect x={startX} y={startY} width={stringSpacing * 5} height={nutHeight} className="fill-white" />
        )}

        {/* 品丝 */}
        {[0, 1, 2, 3, 4].map(fret => (
          <line
            key={fret}
            x1={startX}
            y1={startY + nutHeight + fret * fretHeight}
            x2={startX + stringSpacing * 5}
            y2={startY + nutHeight + fret * fretHeight}
            className="stroke-gray-600"
            strokeWidth={1}
          />
        ))}

        {/* 琴弦 */}
        {[0, 1, 2, 3, 4, 5].map(string => (
          <line
            key={string}
            x1={startX + string * stringSpacing}
            y1={startY}
            x2={startX + string * stringSpacing}
            y2={startY + nutHeight + 4 * fretHeight}
            className="stroke-gray-400"
            strokeWidth={string < 3 ? 2 : 1}
          />
        ))}

        {/* 手指位置 */}
        {chord.frets.map((fret, string) => {
          if (fret === -1) {
            // X 标记 (不弹)
            return (
              <text
                key={string}
                x={startX + string * stringSpacing}
                y={startY - 5}
                textAnchor="middle"
                className="fill-red-500 text-sm font-bold"
              >
                ×
              </text>
            );
          } else if (fret === 0) {
            // O 标记 (空弦)
            return (
              <circle
                key={string}
                cx={startX + string * stringSpacing}
                cy={startY - 8}
                r={4}
                className="fill-none stroke-green-500"
                strokeWidth={2}
              />
            );
          } else {
            // 手指位置
            const displayFret = chord.barPosition ? fret - chord.barPosition + 1 : fret;
            return (
              <g key={string}>
                <circle
                  cx={startX + string * stringSpacing}
                  cy={startY + nutHeight + (displayFret - 0.5) * fretHeight}
                  r={8}
                  className="fill-blue-500"
                />
                {chord.fingers[string] > 0 && (
                  <text
                    x={startX + string * stringSpacing}
                    y={startY + nutHeight + (displayFret - 0.5) * fretHeight + 4}
                    textAnchor="middle"
                    className="fill-white text-xs font-bold"
                  >
                    {chord.fingers[string]}
                  </text>
                )}
              </g>
            );
          }
        })}

        {/* 横按 */}
        {chord.barPosition && (
          <rect
            x={startX - 4}
            y={startY + nutHeight + 0.5 * fretHeight - 6}
            width={stringSpacing * 5 + 8}
            height={12}
            rx={6}
            className="fill-blue-500"
          />
        )}
      </svg>
    </motion.div>
  );
};

// 简谱组件
const JianpuNotation: React.FC<{
  notes: Array<{ number: number; octave: number; duration: number }>;
  timeSignature: [number, number];
}> = ({ notes, timeSignature }) => {
  const octaveMarks = (octave: number) => {
    if (octave > 0) return '·'.repeat(octave);
    if (octave < 0) return '̣'.repeat(-octave);
    return '';
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-white font-bold">{timeSignature[0]}/{timeSignature[1]}</span>
        <span className="text-gray-400">|</span>
      </div>
      <div className="flex flex-wrap items-baseline gap-4 text-2xl font-mono text-white">
        {notes.map((note, i) => (
          <div key={i} className="relative inline-flex flex-col items-center">
            {note.octave > 0 && (
              <span className="absolute -top-4 text-sm">
                {octaveMarks(note.octave)}
              </span>
            )}
            <span className={note.duration < 1 ? 'underline' : ''}>
              {note.number === 0 ? '0' : note.number}
            </span>
            {note.octave < 0 && (
              <span className="absolute -bottom-4 text-sm">
                {octaveMarks(note.octave)}
              </span>
            )}
            {note.duration >= 2 && (
              <span className="ml-1">{'—'.repeat(note.duration - 1)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 工具栏组件
const EditorToolbar: React.FC<{
  currentTool: string;
  currentDuration: string;
  onToolChange: (tool: 'select' | 'note' | 'rest' | 'chord' | 'delete') => void;
  onDurationChange: (duration: Note['duration']) => void;
  onPlay: () => void;
  onStop: () => void;
  onExport: () => void;
  isPlaying: boolean;
}> = ({
  currentTool,
  currentDuration,
  onToolChange,
  onDurationChange,
  onPlay,
  onStop,
  onExport,
  isPlaying,
}) => {
  const tools = [
    { id: 'select', icon: '↖️', label: '选择' },
    { id: 'note', icon: '♩', label: '音符' },
    { id: 'rest', icon: '𝄽', label: '休止符' },
    { id: 'chord', icon: '𝄞', label: '和弦' },
    { id: 'delete', icon: '🗑️', label: '删除' },
  ];

  const durations = [
    { id: 'whole', icon: '𝅝', label: '全音符' },
    { id: 'half', icon: '𝅗𝅥', label: '二分音符' },
    { id: 'quarter', icon: '♩', label: '四分音符' },
    { id: 'eighth', icon: '♪', label: '八分音符' },
    { id: 'sixteenth', icon: '𝅘𝅥𝅯', label: '十六分音符' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-800 rounded-xl">
      {/* 工具选择 */}
      <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
        {tools.map(tool => (
          <motion.button
            key={tool.id}
            className={`px-3 py-2 rounded-lg text-lg transition-colors ${
              currentTool === tool.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToolChange(tool.id as any)}
            title={tool.label}
          >
            {tool.icon}
          </motion.button>
        ))}
      </div>

      {/* 时值选择 */}
      <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
        {durations.map(dur => (
          <motion.button
            key={dur.id}
            className={`px-3 py-2 rounded-lg text-lg transition-colors ${
              currentDuration === dur.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDurationChange(dur.id as Note['duration'])}
            title={dur.label}
          >
            {dur.icon}
          </motion.button>
        ))}
      </div>

      {/* 播放控制 */}
      <div className="flex gap-2 ml-auto">
        <motion.button
          className={`px-4 py-2 rounded-lg font-medium ${
            isPlaying
              ? 'bg-red-500 text-white'
              : 'bg-green-500 text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isPlaying ? onStop : onPlay}
        >
          {isPlaying ? '⏹ 停止' : '▶️ 播放'}
        </motion.button>

        <motion.button
          className="px-4 py-2 rounded-lg bg-slate-700 text-white font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExport}
        >
          📥 导出
        </motion.button>
      </div>
    </div>
  );
};

// 和弦库面板
const ChordLibrary: React.FC<{
  onSelectChord: (chord: Chord) => void;
}> = ({ onSelectChord }) => {
  const [filter, setFilter] = useState<'all' | 'major' | 'minor' | '7'>('all');

  const filteredChords = Object.values(CHORD_LIBRARY).filter(chord => {
    if (filter === 'all') return true;
    if (filter === 'major') return chord.type === 'major';
    if (filter === 'minor') return chord.type === 'minor';
    if (filter === '7') return chord.type === '7';
    return true;
  });

  const playChord = useCallback((chord: Chord) => {
    if (!window.AudioContext) return;

    const audioContext = new AudioContext();
    const frequencies = [82.41, 110, 146.83, 196, 246.94, 329.63]; // E2 A2 D3 G3 B3 E4

    chord.frets.forEach((fret, string) => {
      if (fret === -1) return;

      const frequency = frequencies[string] * Math.pow(2, fret / 12);
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

      oscillator.start(audioContext.currentTime + string * 0.02);
      oscillator.stop(audioContext.currentTime + 1.5);
    });
  }, []);

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-4">和弦库</h3>

      <div className="flex gap-2 mb-4">
        {(['all', 'major', 'minor', '7'] as const).map(f => (
          <button
            key={f}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === f
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-700 text-gray-400'
            }`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '全部' : f === 'major' ? '大调' : f === 'minor' ? '小调' : '七和弦'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 max-h-80 overflow-y-auto">
        {filteredChords.map(chord => (
          <GuitarChordDiagram
            key={chord.name}
            chord={chord}
            size="small"
            onPlay={() => playChord(chord)}
          />
        ))}
      </div>
    </div>
  );
};

// 主组件
export const SheetMusicEditor: React.FC = () => {
  const {
    sheet,
    selectedNote,
    currentTool,
    currentDuration,
    isPlaying,
    playbackPosition,
    setCurrentTool,
    setCurrentDuration,
    addNote,
    removeNote,
    addMeasure,
    updateSheetInfo,
    playSheet,
    stopPlayback,
    exportMusicXML,
  } = useSheetMusic();

  const [viewMode, setViewMode] = useState<'staff' | 'guitar' | 'jianpu'>('staff');
  const [showChordLibrary, setShowChordLibrary] = useState(false);

  // 示例简谱数据
  const jianpuNotes = [
    { number: 1, octave: 0, duration: 1 },
    { number: 2, octave: 0, duration: 1 },
    { number: 3, octave: 0, duration: 1 },
    { number: 1, octave: 0, duration: 1 },
    { number: 1, octave: 0, duration: 1 },
    { number: 2, octave: 0, duration: 1 },
    { number: 3, octave: 0, duration: 1 },
    { number: 1, octave: 0, duration: 1 },
    { number: 3, octave: 0, duration: 1 },
    { number: 4, octave: 0, duration: 1 },
    { number: 5, octave: 0, duration: 2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 标题栏 */}
        <div className="flex items-center justify-between">
          <div>
            <input
              type="text"
              value={sheet.title}
              onChange={(e) => updateSheetInfo({ title: e.target.value })}
              className="text-3xl font-bold bg-transparent text-white border-none outline-none"
              placeholder="乐谱标题"
            />
            <input
              type="text"
              value={sheet.composer}
              onChange={(e) => updateSheetInfo({ composer: e.target.value })}
              className="block text-gray-400 bg-transparent border-none outline-none mt-1"
              placeholder="作曲家"
            />
          </div>

          {/* 视图切换 */}
          <div className="flex gap-2">
            {(['staff', 'guitar', 'jianpu'] as const).map(mode => (
              <motion.button
                key={mode}
                className={`px-4 py-2 rounded-lg font-medium ${
                  viewMode === mode
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-slate-800 text-gray-400'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(mode)}
              >
                {mode === 'staff' ? '五线谱' : mode === 'guitar' ? '吉他谱' : '简谱'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 乐谱设置 */}
        <div className="flex items-center gap-6 p-4 bg-slate-800/50 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">调号:</span>
            <select
              value={sheet.keySignature}
              onChange={(e) => updateSheetInfo({ keySignature: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-3 py-1"
            >
              {['C', 'G', 'D', 'A', 'E', 'B', 'F', 'Bb', 'Eb', 'Ab'].map(key => (
                <option key={key} value={key}>{key} 大调</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400">拍号:</span>
            <select
              value={`${sheet.timeSignature[0]}/${sheet.timeSignature[1]}`}
              onChange={(e) => {
                const [beats, type] = e.target.value.split('/').map(Number);
                updateSheetInfo({ timeSignature: [beats, type] });
              }}
              className="bg-slate-700 text-white rounded-lg px-3 py-1"
            >
              {['4/4', '3/4', '2/4', '6/8', '2/2', '3/8'].map(ts => (
                <option key={ts} value={ts}>{ts}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400">速度:</span>
            <input
              type="number"
              value={sheet.tempo}
              onChange={(e) => updateSheetInfo({ tempo: parseInt(e.target.value) || 120 })}
              className="w-20 bg-slate-700 text-white rounded-lg px-3 py-1"
              min={40}
              max={240}
            />
            <span className="text-gray-500">BPM</span>
          </div>

          <motion.button
            className="ml-auto px-4 py-2 rounded-lg bg-slate-700 text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowChordLibrary(!showChordLibrary)}
          >
            🎸 和弦库
          </motion.button>
        </div>

        {/* 工具栏 */}
        <EditorToolbar
          currentTool={currentTool}
          currentDuration={currentDuration}
          onToolChange={setCurrentTool}
          onDurationChange={setCurrentDuration}
          onPlay={playSheet}
          onStop={stopPlayback}
          onExport={exportMusicXML}
          isPlaying={isPlaying}
        />

        {/* 乐谱显示区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={showChordLibrary ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <AnimatePresence mode="wait">
              {viewMode === 'staff' && (
                <motion.div
                  key="staff"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <StaffNotation
                    sheet={sheet}
                    playbackPosition={playbackPosition}
                    onAddNote={addNote}
                    onRemoveNote={removeNote}
                    currentTool={currentTool}
                  />
                </motion.div>
              )}

              {viewMode === 'guitar' && (
                <motion.div
                  key="guitar"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-slate-800 rounded-xl p-6"
                >
                  <h3 className="text-lg font-bold text-white mb-4">吉他和弦进行</h3>
                  <div className="flex flex-wrap gap-4">
                    {['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm', 'G7'].map((chordName, i) => (
                      <GuitarChordDiagram
                        key={i}
                        chord={CHORD_LIBRARY[chordName]}
                        size="medium"
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {viewMode === 'jianpu' && (
                <motion.div
                  key="jianpu"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <JianpuNotation
                    notes={jianpuNotes}
                    timeSignature={sheet.timeSignature}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 添加小节按钮 */}
            <motion.button
              className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-slate-600 text-gray-400 hover:border-cyan-500 hover:text-cyan-500 transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={addMeasure}
            >
              + 添加小节
            </motion.button>
          </div>

          {/* 和弦库面板 */}
          <AnimatePresence>
            {showChordLibrary && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <ChordLibrary onSelectChord={(chord) => console.log('Selected chord:', chord)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 快捷键提示 */}
        <div className="p-4 bg-slate-800/50 rounded-xl">
          <h4 className="text-sm font-bold text-gray-400 mb-2">快捷键</h4>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span><kbd className="px-2 py-1 bg-slate-700 rounded">Space</kbd> 播放/暂停</span>
            <span><kbd className="px-2 py-1 bg-slate-700 rounded">1-5</kbd> 选择音符时值</span>
            <span><kbd className="px-2 py-1 bg-slate-700 rounded">Delete</kbd> 删除选中</span>
            <span><kbd className="px-2 py-1 bg-slate-700 rounded">Ctrl+S</kbd> 保存</span>
            <span><kbd className="px-2 py-1 bg-slate-700 rounded">Ctrl+E</kbd> 导出</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SheetMusicEditor;
