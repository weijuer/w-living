<template>
    <div class="virtual-list" ref="scrollContainer" @scroll="onScroll" :style="getContainerStyle()">
        <!-- 占位元素，用来撑开滚动区域的总高度 -->
        <div class="virtual-scroll-cursor" :style="getCursorStyle()"></div>

        <!-- 渲染可见的元素 -->
        <div v-for="(item) in visibleItems" :key="item.id" class="virtual-list-item"
            :style="{ height: itemHeight + 'px' }">
            <!-- 使用插槽渲染表格内容 -->
            <slot :item="item"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'virtual-scrolling-list',
    props: {
        items: {
            type: Array,
            required: true // 列表数据
        },
        itemHeight: {
            type: Number,
            default: 50 // 每项的高度
        },
        buffer: {
            type: Number,
            default: 5 // 预渲染的缓冲区项目数
        },
    },
    data() {
        return {
            startIndex: 0, // 当前可视区域的起始索引
            endIndex: 0, // 当前可视区域的结束索引
            containerHeight: 0 // 容器的高度
        };
    },
    computed: {
        visibleItems() {
            return this.items.slice(this.startIndex, this.endIndex);
        },
        totalHeight() {
            return this.items.length * this.itemHeight;
        }
    },
    mounted() {
        this.containerHeight = this.$refs.scrollContainer.clientHeight;
        this.updateVisibleItems();
    },
    methods: {
        onScroll() {
            this.updateVisibleItems();
        },
        updateVisibleItems() {
            const scrollTop = this.$refs.scrollContainer.scrollTop;
            const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);

            this.startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
            this.endIndex = Math.min(
                this.items.length,
                this.startIndex + visibleCount + this.buffer * 2
            );
        },
        getContainerStyle() {
            return {
                transform: `translateY(${(this.startIndex) * this.itemHeight}px)`
            };
        },
        getCursorStyle() {
            return {
                transform: `translate(0px, ${this.totalHeight}px)`
            };
        }
    }
};
</script>

<style>
@layer virtual-scrollling-list {
    .virtual-list {
        position: relative;
        overflow: auto;
        height: 400px;
    }

    .virtual-scroll-cursor {
        position: absolute;
        width: 1px;
        height: 1px;
        transition: transform .2s;
    }

    .virtual-list-item {
        position: absolute;
    }
}
</style>
