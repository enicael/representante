document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/representantes')
      .then(response => response.json())
      .then(data => {
          const representantesDropdown = document.getElementById('representantes');
          representantesDropdown.innerHTML = '<option value="">Selecione um representante</option>';
          data.forEach(representante => {
              const option = document.createElement('option');
              option.value = representante.codigo_representante;
              option.textContent = representante.representante;
              representantesDropdown.appendChild(option);
          });
      })
      .catch(error => console.error('Erro:', error));

  fetch('/api/clientes')
      .then(response => response.json())
      .then(data => {
          const clientesDropdown = document.getElementById('clientes');
          clientesDropdown.innerHTML = '<option value="">Selecione um cliente</option>';
          data.forEach(cliente => {
              const option = document.createElement('option');
              option.value = cliente.codigo_sistema;
              option.textContent = cliente.agn_st_fantasia;
              option.dataset.cliente = JSON.stringify(cliente);
              clientesDropdown.appendChild(option);
          });
      })
      .catch(error => console.error('Erro:', error));
});

document.getElementById('clientes').addEventListener('change', () => {
  const clientesDropdown = document.getElementById('clientes');
  const clienteSelecionado = clientesDropdown.options[clientesDropdown.selectedIndex].dataset.cliente;
  const dadosCliente = JSON.parse(clienteSelecionado || '{}');

  document.getElementById('codigo_sistema').value = dadosCliente.codigo_sistema || '';
  document.getElementById('agn_st_fantasia').value = dadosCliente.agn_st_fantasia || '';
  document.getElementById('cnpj').value = dadosCliente.cnpj || '';
  document.getElementById('cidade').value = dadosCliente.cidade || '';
  document.getElementById('endereco').value = dadosCliente.endereco || '';
  document.getElementById('numero').value = dadosCliente.numero || '';
});

document.getElementById('form').addEventListener('submit', (event) => {
  event.preventDefault();

  const dadosVisita = {
      representante: document.getElementById('representantes').value,
      dataHora: document.getElementById('data_hora').value,
      motivoVisita: document.getElementById('motivo_visita').value,
      produto: document.getElementById('produto').value,
      conclusaoVisita: document.getElementById('conclusao_visita').value,
      conclusoesGerais: document.getElementById('conclusoes_gerais').value,
  };

  fetch('/api/salvar-visita', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosVisita),
  })
  .then(response => response.json())
  .then(data => {
      console.log('Sucesso:', data);
      alert('Dados salvos com sucesso!');
  })
  .catch(error => {
      console.error('Erro:', error);
      alert('Ocorreu um erro ao salvar os dados.');
  });
});
