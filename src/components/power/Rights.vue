<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="rightsList" style="width: 100%" border stripe>
         <el-table-column type="index" label="序号" width="300">
        </el-table-column>
        <el-table-column prop="authName" label="权限名称" width="400">
        </el-table-column>
        <el-table-column prop="path" label="路径" width="400">
        </el-table-column>
        <el-table-column prop="level" label="权限等级" width="520">
            <template slot-scope="scope">
                <el-tag v-if="scope.row.level === '0'">一级</el-tag>
                <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
                <el-tag v-else type="danger">三级</el-tag>
            </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //权限列表
      rightsList: [],
    };
  },
  created() {
    this.getRightsList();
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get("rights/list");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败");
      }
      this.rightsList = res.data;
      //console.log(this.rightsList);
    },
  },
};
</script>

<style>
</style>