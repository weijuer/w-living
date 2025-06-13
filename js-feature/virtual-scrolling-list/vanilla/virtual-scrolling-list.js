export default {
    template: document.getElementById('virtual-list-template'),
    name: 'virtual-scrolling-list',
    props: {
        items: {
            type: Array,
            required: true, // 列表数据
        },
        itemHeight: {
            type: Number,
            default: 50, // 每项的高度
        },
        buffer: {
            type: Number,
            default: 5, // 预渲染的缓冲区项目数
        },
    },
    data() {
        return {
            startIndex: 0, // 当前可视区域的起始索引
            endIndex: 0, // 当前可视区域的结束索引
            containerHeight: 0, // 容器的高度
        };
    },
    computed: {
        visibleItems() {
            return this.items.slice(this.startIndex, this.endIndex);
        },
        totalHeight() {
            return this.items.length * this.itemHeight;
        },
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
            this.endIndex = Math.min(this.items.length, this.startIndex + visibleCount + this.buffer * 2);
        },
        getItemStyle(index) {
            return {
                position: 'absolute',
                top: (this.startIndex + index) * this.itemHeight + 'px',
                height: this.itemHeight + 'px',
                left: 0,
                right: 0,
            };
        },
    },
};