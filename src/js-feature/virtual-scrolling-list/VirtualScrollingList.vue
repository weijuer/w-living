<template>
    <div ref="containerRef" class="virtual-scroll-container" @scroll="onScroll">
        <div class="virtual-scroll-cursor" :style="{ transform: `translate(0px, ${totalHeight}px)` }"></div>
        <div ref="contentRef" :style="{ transform: `translateY(${translateY}px)` }">
            <div v-for="(item, index) in visibleItems" :key="index" class="list-item">
                <slot :item="item"></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watchEffect } from 'vue';

interface Props {
    items: string[];
    containerHeight: number;
    itemHeight: number;
    bufferSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
    items: () => [],
    containerHeight: 500,
    itemHeight: 50,
    bufferSize: 10
});

const containerRef = ref<HTMLDivElement | null>(null);
const contentRef = ref<HTMLDivElement | null>(null);
const translateY = ref(0);
const visibleItems = ref<string[]>([]);

const calculateVisibleItems = () => {
    if (!containerRef.value || !contentRef.value) return;

    const scrollTop = containerRef.value.scrollTop;
    const start = Math.max(0, Math.floor((scrollTop - props.bufferSize) / props.itemHeight));
    const end = Math.min(props.items.length, start + Math.ceil((props.containerHeight + props.bufferSize * 2 * props.itemHeight) / props.itemHeight));

    visibleItems.value = props.items.slice(start, end);
};

const totalHeight = computed(() => props.items.length * props.itemHeight);

const onScroll = () => {
    calculateVisibleItems();
    updateTranslateY();
};

const updateTranslateY = () => {
    if (contentRef.value && containerRef.value) {
        const contentHeight = contentRef.value.scrollHeight;
        const maxTranslateY = contentHeight - props.containerHeight;
        translateY.value = Math.max(0, Math.min(maxTranslateY, containerRef.value.scrollTop));
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
    position: relative;
    height: v-bind(containerHeight + 'px');
    overflow: auto;
    border: 1px solid #ccc;
}

.virtual-scroll-cursor {
    position: absolute;
    width: 1px;
    height: 1px;
    transition: transform .2s;
}

.list-item {
    height: v-bind(itemHeight + 'px');
    line-height: v-bind(itemHeight + 'px');
    border-bottom: 1px solid #eee;
    padding: 0 10px;
}
</style>