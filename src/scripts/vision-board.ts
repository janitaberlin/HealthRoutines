import { loadBoard, saveBoard, type BoardImage } from './storage';

/** My Life: eigenes Vision Board mit Bildern vom Handy. Bilder werden verkleinert und nur auf diesem Gerät gespeichert. */
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

function render(): void {
  grid.replaceChildren(
    ...board.map((b) => {
      const fig = document.createElement('figure');
      fig.className = 'board-item';
      const img = document.createElement('img');
      img.src = b.src;
      img.alt = b.text || 'Vision-Board-Bild';
      const text = document.createElement('input');
      text.className = 'board-text';
      text.placeholder = 'Was bedeutet dieses Bild?';
      text.value = b.text;
      text.addEventListener('change', () => {
        b.text = text.value.trim();
        saveBoard(board);
      });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'board-remove';
      remove.setAttribute('aria-label', 'Bild entfernen');
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        if (!confirm('Bild vom Vision Board entfernen?')) return;
        board = board.filter((x) => x.id !== b.id);
        saveBoard(board);
        render();
      });
      fig.append(img, remove, text);
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
