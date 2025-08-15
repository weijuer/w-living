<template>
    <div class="prompt-input">
        <textarea
            v-model="inputValue"
            class="prompt-input__field"
            placeholder="输入您的问题..."
            :disabled="disabled"
            @keydown.enter.prevent="handleSubmit"
        ></textarea>
        <button
            class="prompt-input__button"
            :disabled="!inputValue.trim() || disabled"
            @click="handleSubmit"
        >
            发送
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";

const props = defineProps<{
    disabled?: boolean;
}>();

const emit = defineEmits<{
    (e: "submit", value: string): void;
}>();

const inputValue = ref("");

const handleSubmit = () => {
    if (inputValue.value.trim()) {
        emit("submit", inputValue.value.trim());
        inputValue.value = "";
    }
};
</script>

<style lang="scss" scoped>
.prompt-input {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid #eee;

    &__field {
        flex: 1;
        min-height: 40px;
        max-height: 120px;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 20px;
        resize: none;
        outline: none;
        font-size: 14px;

        &:focus {
            border-color: #0078d4;
        }

        &:disabled {
            background: #f9f9f9;
            cursor: not-allowed;
        }
    }

    &__button {
        width: 60px;
        height: 40px;
        border: none;
        border-radius: 20px;
        background: #0078d4;
        color: white;
        cursor: pointer;
        transition: background 0.2s;

        &:hover:not(:disabled) {
            background: #005a9e;
        }

        &:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
    }
}
</style>
