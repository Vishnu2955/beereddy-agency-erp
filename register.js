const registerForm = document.getElementById('registerForm');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const passwordField = document.querySelector('.password-field');
const formError = document.getElementById('formError');
const submitButton = document.querySelector('.btn-submit');
let firstStepComplete = false;

window.addEventListener('DOMContentLoaded', () => {
  const card = document.querySelector('.auth-card');
  card.classList.add('scene-started');
});

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  formError.textContent = '';

  if (!firstStepComplete) {
    const nameValue = fullNameInput.value.trim();
    const emailValue = emailInput.value.trim();

    if (!nameValue) {
      formError.textContent = 'Please enter your full name.';
      fullNameInput.focus();
      return;
    }

    if (!emailValue || !/^\S+@\S+\.\S+$/.test(emailValue)) {
      formError.textContent = 'Please enter a valid email address.';
      emailInput.focus();
      return;
    }

    firstStepComplete = true;
    passwordField.classList.remove('hidden');
    passwordField.style.animation = 'fadeInUp 0.7s ease-out forwards';
    submitButton.textContent = 'CREATE ACCOUNT';
    fullNameInput.setAttribute('readonly', '');
    emailInput.setAttribute('readonly', '');
    formError.textContent = '';
    passwordField.querySelector('input').focus();
    return;
  }

  const passwordValue = document.getElementById('password').value.trim();

  if (!passwordValue || passwordValue.length < 6) {
    formError.textContent = 'Please choose a password with at least 6 characters.';
    document.getElementById('password').focus();
    return;
  }

  submitButton.textContent = 'Welcome!';
  submitButton.disabled = true;
  formError.textContent = '';
  registerForm.querySelectorAll('input').forEach((input) => input.setAttribute('disabled', ''));

  const successMessage = document.createElement('p');
  successMessage.className = 'success-message';
  successMessage.textContent = 'Registration step complete. Check your inbox for confirmation.';
  registerForm.appendChild(successMessage);
});
