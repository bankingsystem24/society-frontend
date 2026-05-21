const focusNext = (e: any) => {
  e.preventDefault(); // ❗ stops validation/submit

  const formEl = e.target.form;
  const elements = Array.from(formEl.elements) as HTMLElement[];

  const index = elements.indexOf(e.target);
  const next = elements[index + 1];

  if (next) {
    next.focus();
  }
};

export { focusNext };