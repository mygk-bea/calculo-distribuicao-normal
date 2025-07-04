const tipo = document.getElementById("tipo");
const campoX = document.getElementById("campo-x");
const campoIntervalo = document.getElementById('campo-intervalo');
const campoA = document.getElementById("campo-a");
const campoB = document.getElementById("campo-b");

tipo.addEventListener('change', () => {
  campoX.style.display =  tipo.value === 'entre' ? 'none' : 'block';
  campoIntervalo.style.display = tipo.value === 'entre' ? 'flex' : 'none';
  campoA.style.display =  tipo.value === 'entre' ? 'block' : 'none';
  campoB.style.display =  tipo.value === 'entre' ? 'block' : 'none';
});

let grafico;

function validarInputs(campos) {
  let valido = true;

  campos.forEach(campo => {
    const campoError = document.getElementById(`error-${campo.id}`);
    if (campo.value === '' || isNaN(campo.value) || parseFloat(campo.value) <= 0) {
      campo.classList.add('is-invalid');
      campoError.textContent = {
        media: 'Informe a média corretamente.',
        desvio: 'Informe o desvio padrão corretamente.',
        valorX: 'Informe o valor de X corretamente.',
        valorA: 'Informe o valor de a corretamente.',
        valorB: 'Informe o valor de b corretamente.',
      }[campo.id] || 'Campo inválido ou não reconhecido.';
      valido = false;
    } else {
      campo.classList.remove('is-invalid');
      campoError.textContent = '';
    }
  });

  return valido;
}

function calcular() {
  const mediaInput = document.getElementById('media');
  const desvioInput = document.getElementById('desvio');
  let media = parseFloat(mediaInput.value);
  let desvio = parseFloat(desvioInput.value);

  let resultadoText = "";
  let z1, z2;

  if (tipo.value === 'menor' || tipo.value === 'maior') {
    const xInput = document.getElementById('valorX');
    let x = parseFloat(xInput.value);

    if(!validarInputs([mediaInput, desvioInput, xInput])) return;

    const z = ((x - media) / desvio).toFixed(2);
    const p = calcularDistribuicaoNormal(parseFloat(z));

    if (tipo.value === 'menor') {
      z1 = -5;
      z2 = parseFloat(z);
      resultadoText = `P(X > ${x}) = ${(1 - p).toFixed(4)} (z = ${z})`;
    } else {
      z1 = parseFloat(z);
      z2 = 5;
      resultadoText = `P(X < ${x}) = ${p.toFixed(4)} (z = ${z})`;
    }

  } else if (tipo.value === 'entre') {
    const aInput = document.getElementById('valorA');
    const bInput = document.getElementById('valorB');
    const a = parseFloat(aInput.value);
    const b = parseFloat(bInput.value);

    if(!validarInputs([mediaInput, desvioInput, aInput, bInput])) return;
    let intervaloError = document.getElementById('error-intervalo');
    if (!intervaloError) {
      intervaloError = document.createElement('span');
      intervaloError.id = 'error-intervalo';
      intervaloError.classList.add('text-danger', 'small');
      campoIntervalo.appendChild(intervaloError);
    }

    if (a >= b) {
      intervaloError.textContent = 'O valor de a deve ser menor que b.';
      return;
    } else intervaloError.textContent = '';

    const zA = ((a - media) / desvio).toFixed(2);
    const zB = ((b - media) / desvio).toFixed(2);
    const pA = calcularDistribuicaoNormal(parseFloat(zA));
    const pB = calcularDistribuicaoNormal(parseFloat(zB));
    const resultado = (pB - pA).toFixed(4);
    z1 = parseFloat(zA);
    z2 = parseFloat(zB);

    resultadoText = `P(${a} < X < ${b}) = ${resultado} (zA = ${zA}, zB = ${zB})`;
  }

  document.getElementById('resultado').textContent = resultadoText;
  desenharGrafico(z1, z2);
}

function calcularDistribuicaoNormal(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z < 0) prob = 1 - prob;
  return prob;
}

function densidade(z) {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
}

function desenharGrafico(zMin, zMax) {
  const labels = [];
  const dados = [];
  const area = [];

  for (let x = -5; x <= 5; x += 0.1) {
    const y = densidade(x);
    labels.push(x.toFixed(2));
    dados.push(y);
    area.push(x >= zMin && x <= zMax ? y : null);
  }

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Distribuição Normal Padrão',
        data: dados,
        borderColor: '#dc3545',
        fill: false,
      },
      {
        label: 'Área sob a curva',
        data: area,
        borderColor: 'rgba(0, 0, 0, 0)',
        backgroundColor: '#ffcdcd9a',
        pointRadius: 0,
        fill: true
      }
    ]
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        x: { title: { display: true, text: 'z' } },
        y: { title: { display: true, text: 'Densidade' } }
      }
    }
  };

  if (grafico) grafico.destroy();

  grafico = new Chart(document.getElementById('grafico'), config);
}