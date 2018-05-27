var GS = {
    $selectedNode: null,

    get selectedNode() {
        return this.$selectedNode
    },

    set selectedNode(node) {
        if (isNothing(node)) {
            this.$selectedNode = null
        } else {
            this.$selectedNode = node
        }
        updateSideBar()
    },
    
    pageContents: "",
    panelIndexToStyleSheetIndex: []
}