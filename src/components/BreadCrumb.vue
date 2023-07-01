<template>
    <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item 
            v-for="(item, index) in breadList" 
            key="item.path">
            <!-- 首页实现跳转 -->
            <router-link to="/welcome" v-if="index == 0">
            {{ item.meta.title }}</router-link>
            <span v-else>{{ item.meta.title }}</span>
        
        </el-breadcrumb-item>

    </el-breadcrumb>
</template>
<script>
export default {
    name: "BreadCrumb",
    mounted() {
        console.log(this.$route.matched,'ssss')
    },
    computed: {
        breadList() {
            return this.$route.matched
        }
    }
}
</script>
<style></style>