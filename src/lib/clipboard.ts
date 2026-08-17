/**
 * Copy to the clipboard without ever throwing.
 *
 * `navigator.clipboard.writeText` rejects on a non-secure origin, when the
 * document is not focused, and when the user has denied the permission — and
 * the call sites all fired it as `void navigator.clipboard?.writeText(...)`,
 * which turned every one of those into an unhandled rejection in the console.
 * The old `execCommand` route still works where the modern API is refused, so
 * try it before giving up.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* Fall through to the legacy path. */
  }

  try {
    const field = document.createElement('textarea');
    field.value = text;
    /* Off-screen but still selectable — `display: none` cannot be selected. */
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '-1000px';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(field);
    return ok;
  } catch {
    return false;
  }
}
