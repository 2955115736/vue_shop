<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesDialog = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="item1 in scope.row.children" :key="item1.id">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="cleanItem(scope.row, item1.id)">{{
                  item1.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限 -->
              <el-col :span="19">
                <el-row
                  class="rowStyle"
                  v-for="item2 in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="cleanItem(scope.row, item2.id)"
                      type="success"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      closable
                      @close="cleanItem(scope.row, item3.id)"
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column
          type="index"
          label="序号"
          width="300"
        ></el-table-column>
        <el-table-column
          prop="roleName"
          label="角色名称"
          width="400"
        ></el-table-column>
        <el-table-column
          prop="roleDesc"
          label="角色描述"
          width="400"
        ></el-table-column>
        <el-table-column label="操作" width="488">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="showEditRole(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="removeRole(scope.row.id)"
            ></el-button>
            <el-tooltip
              effect="dark"
              content="分配角色权限"
              placement="top"
              enterable
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                @click="showRights(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加角色 -->
      <el-dialog
        title="添加角色"
        :visible.sync="addRolesDialog"
        width="30%"
        @close="clearAddFrom"
      >
        <el-form
          :model="addRoleForm"
          :rules="addRoleFormRules"
          ref="addRoleFormRef"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRolesDialog = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改角色 -->
      <el-dialog
        title="修改角色"
        :visible.sync="editRolesDialog"
        width="30%"
        @close="clearEditFrom"
      >
        <el-form
          :model="editRoleForm"
          :rules="editRoleFormRules"
          ref="editRoleFormRef"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editRolesDialog = false">取 消</el-button>
          <el-button type="primary" @click="editRoles">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分配权限对话框 -->
      <el-dialog title="分配权限" :visible.sync="dialogVisible" width="20%" @close="cleanDialog">
        <el-tree
          :data="rightsList"
          :props="treeProps"
          default-expand-all
          :default-checked-keys="nodeKeys"
          show-checkbox
          node-key="id"
          ref="treeRef"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allRights"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      addRolesDialog: false,
      editRolesDialog: false,
      //添加用户表单对象
      addRoleForm: {
        roleName: "",
        roleDesc: "",
      },
      //验证添加角色信息
      addRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },
      //编辑角色的信息
      editRoleForm: {},
      //验证修改角色信息
      editRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },
      //分配角色权限对话框显示隐藏
      dialogVisible: false,
      //分配权限列表的数据
      rightsList: [],
      //树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        //父子节点通过哪个属性嵌套
        children: "children",
      },
      //默认展开的权限绑定
      nodeKeys:[],
      //角色id
      roleId:'',
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.rolesList = res.data;
      //console.log(res);
    },

    //关闭添加角色对话框清除信息
    clearAddFrom() {
      this.$refs.addRoleFormRef.resetFields();
    },
    //关闭修改角色对话框清除信息
    clearEditFrom() {
      this.$refs.editRoleFormRef.resetFields();
    },
    //添加角色
    addRoles() {
      this.$refs.addRoleFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.addRoleForm);
        //console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error("添加角色失败");
        }
        this.$message.success("添加角色成功");
        this.addRolesDialog = false;
        this.getRolesList();
      });
    },

    //编辑时获取角色信息
    async showEditRole(id) {
      this.editRolesDialog = true;
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色信息失败");
      }
      this.editRoleForm = res.data;
      //console.log(this.editRoleForm);
    },

    //提交修改角色信息
    editRoles() {
      this.$refs.editRoleFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "roles/" + this.editRoleForm.roleId,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc,
          }
        );
        //console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("角色信息修改失败");
        }
        //关闭对话框
        this.editRolesDialog = false;
        //提示成功的消息
        this.$message.success("角色信息修改成功");
        //刷新角色列表
        this.getRolesList();
      });
    },

    //删除角色
    async removeRole(id) {
      const result = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => {
        err;
      });
      //console.log(result);
      if (result !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色失败");
      }
      this.$message.success("删除角色成功");
      this.getRolesList();
    },

    //删除三级权限标签
    async cleanItem(role, rightId) {
      const result = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => {
        err;
      });
      if (result !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      role.children = res.data;
    },

    //分配获取角色权限
    async showRights(role) {
      const { data: res } = await this.$http.get("rights/tree");
      //console.log(res);
      //保存role.id为下面allRights的使用
      this.roleId = role.id
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败");
      }
      this.rightsList = res.data;
      this.getKeys(role,this.nodeKeys);
      //console.log(this.nodeKeys);
      this.dialogVisible = true;
    },

    //通过递归的形式，获取角色下所有三级权限的id，并保存到nodeKeys数组中
    getKeys(node,arr){
      //如果当前node节点不包括children属性，则是三级节点
      if(!node.children){
        return arr.push(node.id)
      }
      
      node.children.forEach(item => 
      this.getKeys(item,arr))
    },

    //监听对话框关闭的事件处理
    cleanDialog(){
      this.nodeKeys = []
    },

    //获取并提交选中的权限
    async allRights(){
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      //console.log(keys);
      const idStr = keys.join(',')

      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if(res.meta.status !== 200){
        return this.$message.error('分配角色权限失败')
      }
      this.$message.success('分配角色权限成功')
      this.dialogVisible = false
      this.getRolesList()
    }
  },
};
</script>

<style lang="scss" scoped>
.el-tag {
  margin: 20px;
}
.el-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
}
.el-row:first-child {
  border-top: 1px solid #eee;
}
.rowStyle {
  border-top: 1px solid #eee;
}
.rowStyle:first-child {
  border: none;
}
</style>