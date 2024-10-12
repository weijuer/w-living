<template>
    <div ref="containerRef" class="virtual-scroll-container" @scroll="onScroll">
        <!-- <div class="virtual-scroll-cursor" :style="getCursorStyle()"></div> -->
        <div ref="contentRef" :style="{ transform: `translateY(${translateY}px)` }">
            <div v-for="(item, index) in visibleItems" :key="index" class="list-item">
                <slot :item="item"></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';

interface Props {
    items: string[];
    containerHeight: number;
    itemHeight: number;
}

const props = withDefaults(defineProps<Props>(), {
    items: () => [],
    containerHeight: 500,
    itemHeight: 50,
});

const containerRef = ref<HTMLDivElement | null>(null);
const contentRef = ref<HTMLDivElement | null>(null);
const translateY = ref(0);
const visibleItems = ref<string[]>([]);

const calculateVisibleItems = () => {
    if (!containerRef.value || !contentRef.value) return;

    const scrollTop = containerRef.value.scrollTop;
    const start = Math.max(0, Math.floor(scrollTop / props.itemHeight));
    const end = Math.min(props.items.length, Math.ceil((scrollTop + props.containerHeight) / props.itemHeight));

    visibleItems.value = props.items.slice(start, end);
};

const onScroll = () => {
    calculateVisibleItems();
    updateTranslateY();
};

const updateTranslateY = () => {
    if (contentRef.value && containerRef.value) {
        const contentHeight = contentRef.value.scrollHeight;
        const maxTranslateY = contentHeight - props.containerHeight;
        translateY.value = Math.min(0, Math.max(maxTranslateY, containerRef.value.scrollTop * -1));
    }
};

onMounted(() => {
    calculateVisibleItems();
    updateTranslateY();
});

watchEffect(() => {
    calculateVisibleItems();
    updateTranslateY();
});
</script>

<style scoped>
.virtual-scroll-container {
    height: v-bind(containerHeight + 'px');
    overflow: auto;
    border: 1px solid #ccc;
}

.list-item {
    height: v-bind(itemHeight + 'px');
    line-height: v-bind(itemHeight + 'px');
    border-bottom: 1px solid #eee;
    padding: 0 10px;
}
</style>