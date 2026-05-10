interface ChapterRangeSelectorProps {
  startChapter: number;
  endChapter: number;
  targetGroupWordCount: number;
  disabled?: boolean;
  onStartChange: (value: number) => void;
  onEndChange: (value: number) => void;
  onTargetGroupWordCountChange: (value: number) => void;
}

function parseNumber(value: string, fallback: number): number {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 1) {
    return fallback;
  }
  return Math.floor(numberValue);
}

export function ChapterRangeSelector({
  startChapter,
  endChapter,
  targetGroupWordCount,
  disabled,
  onStartChange,
  onEndChange,
  onTargetGroupWordCountChange
}: ChapterRangeSelectorProps) {
  return (
    <div className="rangeGrid">
      <label>
        起始章节
        <input
          type="number"
          min="1"
          value={startChapter}
          disabled={disabled}
          onChange={(event) => onStartChange(parseNumber(event.target.value, startChapter))}
        />
      </label>
      <label>
        结束章节
        <input
          type="number"
          min="1"
          value={endChapter}
          disabled={disabled}
          onChange={(event) => onEndChange(parseNumber(event.target.value, endChapter))}
        />
      </label>
      <label>
        每组目标字数
        <input
          type="number"
          min="1000"
          step="500"
          value={targetGroupWordCount}
          disabled={disabled}
          onChange={(event) => onTargetGroupWordCountChange(parseNumber(event.target.value, targetGroupWordCount))}
        />
      </label>
    </div>
  );
}
