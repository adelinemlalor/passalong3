import { useRef, useState } from 'react';
import { Camera, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PhotoPicker({ image, onChange }: { image: string; onChange: (image: string) => void }) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);

  function selectPhoto(file?: File) {
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please choose a photo.');
      return;
    }
    setReading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setReading(false);
      if (typeof reader.result === 'string') onChange(reader.result);
      else setError('That photo could not be opened. Please try another.');
    };
    reader.onerror = () => { setReading(false); setError('That photo could not be opened. Please try another.'); };
    reader.readAsDataURL(file);
  }

  return <div className="space-y-3">
    <input ref={cameraRef} aria-label="Camera photo" type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { selectPhoto(e.target.files?.[0]); e.target.value = ''; }} />
    <input ref={uploadRef} aria-label="Upload photo file" type="file" accept="image/*" className="hidden" onChange={e => { selectPhoto(e.target.files?.[0]); e.target.value = ''; }} />
    <div className="photo-upload" aria-busy={reading}>
      {image ? <img src={image} alt="Your offer" /> : <><Camera size={38} /><strong>{reading ? 'Opening your photo…' : 'Add a photo'}</strong><span>Snap it now or pick one from your photos</span></>}
    </div>
    <div className="photo-actions grid grid-cols-2 gap-3">
      <Button disabled={reading} onClick={() => cameraRef.current?.click()}><Camera size={18} />Take a photo</Button>
      <Button disabled={reading} variant="outline" onClick={() => uploadRef.current?.click()}><ImagePlus size={18} />Upload photo</Button>
    </div>
    {error && <p role="alert" className="text-sm text-primary">{error}</p>}
  </div>;
}