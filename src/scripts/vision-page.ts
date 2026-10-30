import { loadBoard, saveBoard, type BoardImage, type TileSize } from './storage';

/** Vision Board: eigene Bilder vom Handy als dichtes Raster; Reihenfolge und große Kacheln wählt Janita selbst. Bilder werden verkleinert und nur auf diesem Gerät gespeichert. */
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

const view = document.getElementById('board-view') as HTMLDialogElement;
const viewImg = document.getElementById('board-view-img') as HTMLImageElement;
const viewText = document.getElementById('board-view-text') as HTMLInputElement;
let open: BoardImage | null = null;

function showArrange(): void {
  if (!open) return;
  const i = board.findIndex((x) => x.id === open!.id);
  document.getElementById('board-pos')!.textContent = `${i + 1} von ${board.length}`;
  (document.getElementById('board-first') as HTMLButtonElement).disabled = i === 0;
  (document.getElementById('board-prev') as HTMLButtonElement).disabled = i === 0;
  (document.getElementById('board-next') as HTMLButtonElement).disabled = i === board.length - 1;
  (document.getElementById('board-last') as HTMLButtonElement).disabled = i === board.length - 1;
  const size = sizeOf(open);
  document.querySelectorAll<HTMLButtonElement>('[data-size]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.size === size)));
}

function show(b: BoardImage): void {
  open = b;
  viewImg.src = b.src;
  viewText.value = b.text;
  showArrange();
  view.showModal();
}

/** Bild an eine neue Stelle schieben; die Reihenfolge bestimmt Janita selbst. */
function move(to: (i: number) => number): void {
  if (!open) return;
  const i = board.findIndex((x) => x.id === open!.id);
  const j = Math.max(0, Math.min(board.length - 1, to(i)));
  if (i === j) return;
  const [item] = board.splice(i, 1);
  board.splice(j, 0, item);
  saveBoard(board);
  render();
  showArrange();
}
document.getElementById('board-first')!.addEventListener('click', () => move(() => 0));
document.getElementById('board-prev')!.addEventListener('click', () => move((i) => i - 1));
document.getElementById('board-next')!.addEventListener('click', () => move((i) => i + 1));
document.getElementById('board-last')!.addEventListener('click', () => move(() => board.length - 1));
document.querySelectorAll<HTMLButtonElement>('[data-size]').forEach((b) =>
  b.addEventListener('click', () => {
    if (!open) return;
    open.size = b.dataset.size as TileSize;
    saveBoard(board);
    render();
    showArrange();
  }),
);

/** Ohne eigene Wahl klein, damit das Raster lückenlos bleibt. */
function sizeOf(b: BoardImage): TileSize {
  return b.size ?? 'klein';
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
    ...board.map((b) => {
      const fig = document.createElement('button');
      fig.type = 'button';
      fig.className = 'collage-item';
      fig.dataset.tile = sizeOf(b);
      const img = document.createElement('img');
      img.alt = b.text || 'Vision-Bild';
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
