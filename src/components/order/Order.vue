<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <el-table :data="orderList" border stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="70px">
        </el-table-column>
        <el-table-column prop="order_id" label="订单编号"> </el-table-column>
        <el-table-column prop="order_price" label="订单价格"> </el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'"
              >未付款</el-tag
            >
            <el-tag type="success" v-else></el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"> </el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="editdialogVisible = true"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              @click="showProgress"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editdialogVisible"
      width="40%"
      @close="cleanForm"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editdialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 物流位置对话框 -->
    <el-dialog title="提示" :visible.sync="progressVisible" width="40%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressData"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata";
import axios from "axios";

export default {
  data() {
    return {
      orderList: [],

      queryInfo: {
        query:'',
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      editdialogVisible: false,

      addForm: {
        address1: "",
        address2: "",
      },

      addFormRules: {
        address1: [
          { required: true, message: "请填写省市区/县", trigger: "blur" },
        ],
        address2: [
          { required: true, message: "请填写详细地址", trigger: "blur" },
        ],
      },
      cityData,
      progressVisible: false,
      progressData: [],
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败");
      }
      this.orderList = res.data.goods;
      this.total = res.data.total;
      //console.log(res);
    },

    //分页pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    //分页pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },

    cleanForm() {
      this.$refs.addFormRef.resetFields();
    },
    //展示物流信息
    async showProgress() {
      await axios.get("http://localhost:8080/address.json").then((res) => {
        this.progressData = res.data.data;
        console.log(this.progressData);
      });
      this.progressVisible = true;
    },

    //订单查询
    /* async searchOrders(){
        const {data:res} = await this.$http.get('orders',{
            params:this.queryInfo
        })
        if(res.meta.status !== 200){
            return this.$message.error('查找订单失败')
        }
        this.orderList = res.data.goods;
        this.total = res.data.total;
    } */
  },
};
</script>

<style lang="scss" scoped>
.el-cascader {
  width: 100%;
}
</style>