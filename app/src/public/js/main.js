document.addEventListener('DOMContentLoaded', () => {
  const inputBusca = document.getElementById('input-busca');
  const tbody = document.getElementById('tbody-clientes');

  if (!inputBusca || !tbody) return;

  inputBusca.addEventListener('input', () => {
    // Normaliza o termo digitado para caixa baixa (case-insensitive)
    const termo = inputBusca.value.toLowerCase().trim();
    const linhas = tbody.getElementsByTagName('tr');

    Array.from(linhas).forEach(linha => {
      // Captura todo o texto contido na linha (ID, Nome, Email, CPF, etc)
      const textoLinha = linha.textContent.toLowerCase();

      // Exibe a linha se o termo estiver contido no texto, senão esconde
      if (textoLinha.includes(termo)) {
        linha.style.display = '';
      } else {
        linha.style.display = 'none';
      }
    });
  });
});