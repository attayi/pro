<script>
import TreeMenu from './TreeMenu.vue'
import breadcrumb from './BreadCrumb.vue'
import {Setting,Fold,Bell,ArrowDown } from '@element-plus/icons'
export default {
  name: "home",
  components: {
    TreeMenu,
    setting: Setting,
    fold: Fold,
    bell: Bell,
    ArrowDown:ArrowDown,
    breadcrumb
  },
  mounted() {
    this.getNoticeCount();
    this.getMenuList();
  },
  data() {
    return {
      userMenu: [],
      isCollapse: false,
      // userInfo: {
      //   userName:'yan',
      //   userEmail:'yan@admin.com'
      // },
      userInfo:this.$store.state.userInfo || {},
      noticeCount: 0,
    }
  },
  // mounted() {
  //   this.getMenuList();
  // },
  computed: {
      noticeCount() {
        return this.$store.state.noticeCount
      }},
  methods: {
    handleLogout(key) {
      if (key == 'email') return
      this.$store.commit("saveUserInfo", "");
      this.userInfo = null;
      this.$router.push("/login") 
    },
    toggle() {
      this.isCollapse = !this.isCollapse;
      console.log(this.$route.matched)
    },
    async getNoticeCount() {
      // 请求接口
      const res = await this.$api.noticeCount();
      console.log(res);
      // this.noticeCount = res;
      this.$store.commit('saveNoticeCount',res)
    },
    async getMenuList() {
      const { menuList, actionList }= await this.$api.permissionList();
      this.userMenu = menuList;
      this.$store.commit("saveMenuList", menuList);
      this.$store.commit("saveActionList", actionList)
      // this.userMenu = menuList;
      // this.$store.commit("saveMenuList", menuList);
      // this.$store.commit("saveActionList", actionList);
    }
    // async getMenuList() {
    //   console.log("sssss")

    //   const {menuList, actionList } = await this.$api.permissionList();
    //   console.log(menuList)
    //   this.userMenu = menuList;
    //   this.$store.commit('saveMenuList', menuList);
    //   this.$store.commit('saveActionList', actionList)
    // }
  }
}



</script>

<template>
  <div class="basic-layout">
    <div :class="['nav-side', isCollapse ? 'fold' : 'unfold']">
      <div class="logo">
        <img src="./../assets/logo.png" />
        <span>Manager</span>
      </div>
      <!--菜单-->
      <el-menu 
      class="nav-menu" 
      background-color="#001529" 
      text-color="#fff" 
      :collapse="isCollapse" 
      router>
        <!-- <el-sub-menu>
          <template #title>
            <setting class="menu-setting"></setting>
            <span>系统管理</span>
          </template>
          <el-menu-item>用户管理</el-menu-item>
          <el-menu-item>菜单管理</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>
            <setting class="menu-setting"></setting>
            <span>审批管理</span>
          </template>
          <el-menu-item index="2-1">休假管理</el-menu-item>
          <el-menu-item index="2-2">带我审批</el-menu-item>
        </el-sub-menu> -->
        <tree-menu :userMenu="userMenu"/>
      </el-menu>
    </div>

    <div :class="['content-right', isCollapse ? 'fold' : 'unfold']">
      <div class="nav-top">
        <!--面包屑-->
        <div class="nav-left">
          <fold class="menu-fold" @click="toggle"></fold>
          <div class="bread">
            <breadcrumb />
          </div>
        </div>
        <!--右侧-->
        <div class="user-info">
          <!--提示-->
          <el-badge 
          :is-dot="noticeCount > 0 ? true : false"
          class="notice" type="danger">
            <!--图标-->
            <i class="el-icon-bell"/>
          </el-badge>
          <!--下拉菜单-->
          <el-dropdown @command="handleLogout">
            <span class="user-link">
                {{ userInfo.userName }}
                <el-icon>
                  <arrowDown/>
                </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item 
                command="email">邮箱: {{ userInfo.userEmail }}</el-dropdown-item>
                <el-dropdown-item  command="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

        </div>
      </div>
    

      <div class="wrapper">
          <router-view></router-view>
      </div>
    </div>
</div>

</template>

<style scoped lang="scss">
.basic-layout {
  position: relative;

  .nav-side {
    position: fixed;
    width: 200px;
    height: 100vh;
    background-color: #001529;
    color: #fff;
    overflow-y: auto;
    transition: width 0.5s;

    &.fold {
      width: 64px
    }

    &.unfold {
      width: 200px
    }

    .logo {
      display: flex;
      align-items: center;
      font-size: 18px;
      height: 50px;

      img {
        margin: 0 16px;
        width: 32px;
        height: 32px;
      }
    }

    .nav-menu {
      .menu-setting {
        width: 20px;
        height: 20px;
        margin-right: 12px
      }

      border-right: none;
    }
  }

  .content-right {
    margin-left: 200px;

    &.fold {
      margin-left: 64px;
    }

    &.unfold {
      margin-left: 200px;
    }

    .nav-top {
      height: 50px;
      line-height: 50px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #ddd;
      padding: 0 20px;

      .nav-left {
        display: flex;
        align-items: center;

        .menu-fold {
          width: 25px;
          height: 25px;
          margin-right: 15px;
        }

        // z-index: 1;
      }

      .user-info {
        display: flex;
        align-items: center;

        .user-badge {
          line-height: 30px;
          margin-right: 2px
        }
        .notice {
          line-height: 30px;
          margin-right: 15px
        }

        .user-link {
          cursor: pointer;
          color: #409eff;
        }
      }
    }

    .wrapper {
      background: #eef0f3;
      padding: 20px;
      height: calc(100vh - 50px);

      .main-page {
        height: 100%;
        background-color: #fff;
      }
    }
  }
}
</style>
