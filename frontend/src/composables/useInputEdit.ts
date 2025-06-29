import { ref, nextTick } from 'vue';

export function useUIEdit(
  currentValue: () => string | undefined,
  handleSubmit: (newValue: string) => unknown,
) {
  const isEditing = ref(false);
  const value = ref(currentValue());
  const inputRef = ref<HTMLInputElement | null>(null);

  function startEditing() {
    isEditing.value = true;
    value.value = currentValue();

    nextTick(() => {
      inputRef.value?.focus();
      inputRef.value?.select();
    });
  }

  function onInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
  }

  function onSubmit() {
    isEditing.value = false;

    if (!value.value || value.value == currentValue()) return;

    handleSubmit(value.value);

    value.value = currentValue();
  }

  return {
    isEditing,
    value,
    inputRef,
    startEditing,
    onInputKeydown,
    onSubmit,
  };
}
