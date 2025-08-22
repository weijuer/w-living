<template>
    <div class="message" :class="{ 'message--user': isUser }" ref="messageRef">
        <div class="message__bubble">
            <div class="message__content" v-html="content"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

defineProps<{
    content: string;
    isUser: boolean;
}>();

const messageRef = ref<HTMLDivElement>();

onMounted(() => {
    if (messageRef.value) {
        messageRef.value.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" })
    }
})
</script>

<style lang="scss" scoped>
.message {
    max-width: 80%;
    margin-bottom: 12px;
    align-self: flex-start;

    &--user {
        align-self: flex-end;
    }

    &__bubble {
        padding: 8px 12px;
        border-radius: 18px;
        background: #f1f1f1;

        .message--user & {
            background: #0078d4;
            color: white;
        }
    }

    &__content {
        word-break: break-word;
        font-size: 14px;
        line-height: 1.5;
    }
}
</style>
