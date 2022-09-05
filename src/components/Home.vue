<template>
  <el-container class="home">
    <el-header>
      <!-- 头部 -->
      <div class="logo">
        <img src="../assets/img/logo.png" />
        <span>电商后台管理系统</span>
      </div>
      <div>
        <el-dropdown size="small">
          <span class="el-dropdown-link">
            <img
              src="../assets/img/head.jpg"
              style="width:60px;height60px;border-radius:50%"
            />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <span @click="logout">退出</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="collapse">
          <span class="hand" @click="asideCollapse"
            ><img :src="imgUrl"
          /></span>
        </div>
        <el-menu
          background-color="#54626F"
          text-color="#fff"
          active-text-color="#409BFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <template slot="title">
              <i :class="iconsObjs[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/'+subItem.path)"
              
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 主体内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      isCollapse: false,
      menuList: [],
      iconsObjs: {
        125: "iconfont icon-users",
        103: "iconfont icon-quanxian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-dingdan",
        145: "iconfont icon-shuju",
      },
      activePath:'',
      isChange:false,
      imgUrl:require('../assets/img/left.png')
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menuList = res.data;
      //console.log(this.menuList);
    },
    asideCollapse() {
      this.isCollapse = !this.isCollapse;
      
      if(!this.isChange){
        this.isChange = !this.isChange;
        this.imgUrl = require('../assets/img/right.png')
      }else{
        this.isChange = !this.isChange;
        this.imgUrl = require('../assets/img/left.png')
      }
    },
    saveNavState(activePath){
        window.sessionStorage.setItem('activePath',activePath);
        this.activePath = activePath;
    }
  },
};
</script>

<style lang="scss" scoped>
/* .el-main{
    padding: 0;
} */
.home {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  background: #54626f;
  .logo {
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      width: 30px;
      height: 30px;
    }
    span {
      font-size: 20px;
      font-weight: bold;
      color: #fff;
      margin-left: 10px;
    }
  }
}
.el-aside {
  background: #54626f;
  .el-menu {
    border: none;
  }
}
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
.el-submenu {
  span {
    font-size: 16px;
    margin-left: 10px;
  }
}
.collapse {
  text-align: center;
}
.hand{
    cursor: pointer;
}
</style>