// AUTOR: Cezar Augusto Fernandez Rull - RA: 25007452

document.addEventListener("DOMContentLoaded", () => {
  const codeInputs = Array.from(document.querySelectorAll(".code-input"));

  codeInputs.forEach((input, index) => {
    input.addEventListener("keydown", (e) => {
      const key = e.key;

      // Permitir teclas de controle
      if (["Backspace", "Tab", "ArrowLeft", "ArrowRight"].includes(key)) {
        if (key === "Backspace" && !input.value && index > 0) {
          codeInputs[index - 1].focus();
        }
        return;
      }

      // Bloquear qualquer coisa que não seja número
      if (!/^[0-9]$/.test(key)) {
        e.preventDefault();
      }
    });

    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g, "").slice(0, 1);
      if (input.value && index < codeInputs.length - 1) {
        codeInputs[index + 1].focus();
      }
    });
  });

  // Função helper que distribui um texto numérico pelos inputs
  function distributeCode(rawText) {
    const paste = (rawText || "").replace(/[^0-9]/g, "");
    if (!paste) return false;

    const active = document.activeElement;
    const startIndex = codeInputs.indexOf(active) >= 0 ? codeInputs.indexOf(active) : 0;

    // Se o código tem o mesmo tamanho dos inputs, preenche tudo começando do 0
    if (paste.length === codeInputs.length) {
      codeInputs.forEach((el, i) => (el.value = paste[i] || ""));
      codeInputs[codeInputs.length - 1].focus();
      return true;
    }

    // Senão, preenche a partir do input focado (ou do 0)
    paste
      .slice(0, codeInputs.length - startIndex)
      .split("")
      .forEach((char, i) => {
        if (codeInputs[startIndex + i]) codeInputs[startIndex + i].value = char;
      });

    const lastFilled = Math.min(startIndex + paste.length - 1, codeInputs.length - 1);
    if (codeInputs[lastFilled]) codeInputs[lastFilled].focus();
    return true;
  }

  // --- ESCUTA PASTE GLOBAL (botão direito / menu) ---
  document.addEventListener("paste", (e) => {
    const pasteText = (e.clipboardData || window.clipboardData).getData("text");
    if (!pasteText) return;
    // prevenimos para garantir comportamento consistente
    e.preventDefault();
    distributeCode(pasteText);
  });

  // --- ESCUTA CTRL/CMD + V (fallback/garantia para Ctrl+V) ---
  document.addEventListener("keydown", (e) => {
    const isPasteShortcut =
      (e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V");

    if (!isPasteShortcut) return;

    // tenta usar a clipboard API (assincrona)
    if (navigator.clipboard && navigator.clipboard.readText) {
      e.preventDefault(); // prevenir comportamento nativo para controlar preenchimento
      navigator.clipboard
        .readText()
        .then((text) => {
          if (!text) return;
          distributeCode(text);
        })
        .catch(() => {
          // Se falhar (permissão negada), deixamos que o evento paste padrão aconteça
        });
    }
    // se não tiver navigator.clipboard, deixamos o evento paste normal ocorrer
  });
});