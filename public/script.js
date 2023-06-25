const socket = io();

socket.on('connect', () => {
  const mentorId = getParameterByName('mentorId');
  if (mentorId) {
    socket.emit('joinAsMentor', { mentorId });
  } else {
    socket.emit('joinAsStudent');
  }
});

socket.on('mentorId', (mentorId) => {
  const codeInput = document.getElementById('code-input');
  codeInput.disabled = socket.id !== mentorId;
});

socket.on('codeUpdated', (data) => {
  const codeInput = document.getElementById('code-input');
  codeInput.value = data.code;
});

document.getElementById('code-input').addEventListener('input', (event) => {
    console.log("hi");
  const updatedCode = event.target.value;
  socket.emit('codeChange', { code: updatedCode });
});

function getParameterByName(name, url = window.location.href) {
    console.log("hi1");
  name = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
