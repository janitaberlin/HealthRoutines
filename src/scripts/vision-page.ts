import { loadBoard, saveBoard, type BoardImage } from './storage';

/** Vision Board: eigene Bilder vom Handy als Collage. Bilder werden verkleinert und nur auf diesem Gerät gespeichert. */
const grid = document.getElementById('board-grid')!;
const input = document.getElementById('board-add') as HTMLInputElement;
const status = document.getElementById('board-status')!;
let board = loadBoard();

function shrink(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 900 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/** Collage: Kachelgröße nach Bildformat, das erste Bild groß; dichte Anordnung füllt Lücken. */
function span(fig: HTMLElement, img: HTMLImageElement, i: number): void {
  const ratio = img.naturalWidth / img.naturalHeight || 1;
  const kind = ratio > 1.25 ? 'wide' : ratio < 0.8 ? 'tall' : 'square';
  fig.dataset.kind = i === 0 ? `hero-${kind}` : kind;
}

const view = document.getElementById('board-view') as HTMLDialogElement;
const viewImg = document.getElementById('board-view-img') as HTMLImageElement;
const viewText = document.getElementById('board-view-text') as HTMLInputElement;
let open: BoardImage | null = null;

function show(b: BoardImage): void {
  open = b;
  viewImg.src = b.src;
  viewText.value = b.text;
  view.showModal();
}
viewText.addEventListener('change', () => {
  if (!open) return;
  open.text = viewText.value.trim();
  saveBoard(board);
  render();
});
document.getElementById('board-view-remove')!.addEventListener('click', () => {
  if (!open || !confirm('Bild vom Vision Board entfernen?')) return;
  board = board.filter((x) => x.id !== open!.id);
  saveBoard(board);
  view.close();
  render();
});

function render(): void {
  document.getElementById('board-empty')!.hidden = board.length > 0;
  grid.replaceChildren(
    ...board.map((b, i) => {
      const fig = document.createElement('button');
      fig.type = 'button';
      fig.className = 'collage-item';
      const img = document.createElement('img');
      img.alt = b.text || 'Vision-Bild';
      img.addEventListener('load', () => span(fig, img, i));
      img.src = b.src;
      fig.append(img);
      if (b.text) {
        const cap = document.createElement('span');
        cap.textContent = b.text;
        fig.append(cap);
      }
      fig.addEventListener('click', () => show(b));
      return fig;
    }),
  );
}

input.addEventListener('change', async () => {
  const files = [...(input.files ?? [])];
  input.value = '';
  status.textContent = '';
  for (const file of files) {
    try {
      const item: BoardImage = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, src: await shrink(file), text: '' };
      if (!saveBoard([...board, item])) {
        status.textContent = 'Der Speicher ist voll. Bitte ein Bild entfernen.';
        break;
      }
      board.push(item);
    } catch {
      status.textContent = 'Dieses Bild konnte nicht geladen werden.';
    }
  }
  render();
});

render();
