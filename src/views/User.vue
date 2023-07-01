<template>
    <div class="user-manage">
        <div class="query-form">
            <el-form :inline="true" :model="user" ref="form">
                <el-form-item label="用户ID" prop="userId">
                    <el-input v-model="user.userId" placeholder="请输入用户id" />
                </el-form-item>
                <el-form-item label="用户名称" prop="userName">
                    <el-input v-model="user.userName" placeholder="请输入用户名称" />
                </el-form-item>
                <el-form-item label="用户状态" prop="state">
                    <el-select v-model="user.state">
                        <el-option label="所有" value="0" />
                        <el-option label="在职" value="1" />
                        <el-option label="离职" value="2" />
                        <el-option label="试用期" value="3" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleQuery">查询</el-button>
                    <el-button @click="handleReset('form')">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
    <!--表格-->
    <div class="base-table">
        <div class="action">
            <el-button type="primary" @click="handleCreate" v-has="'user-add'">新增</el-button>
            <el-button type="danger" @click="handlePatchDelete"  v-has="'user-patch-delete'"
>批量删除</el-button>
        </div>
        <el-table style="width: 100%" :data="userList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
                :width="item.width" :formatter="item.formatter" />

            <el-table-column label="操作" width="200">
                <template #default="scope">
                    <el-button type="primary" size="mini"
                    @click="handleEdit(scope.row)" v-has="'user-edit'"
>编辑</el-button>
                    <el-button type="danger" size="mini" @click="handelDelete(scope.row)"
                    v-has="'user-delete'"
>删除</el-button>
                </template>
            </el-table-column>

        </el-table>
        <el-pagination background layout="prev, pager, next" :total=pager.total @current-change="handleCurrentChange" />

        <!--模态框-->
        <el-dialog title="用户新增" v-model="showModal">
            <el-form :model="userForm" ref="dialogForm" label-width="120px" :rules="rules">
                <el-form-item prop="userName" label="用户名">
                    <el-input placeholder="请输入用户名" v-model="userForm.userName" :disabled="action == 'edit'" />
                </el-form-item>
                <el-form-item prop="userEmail" label="邮箱">
                    <el-input placeholder="请输入邮箱" v-model="userForm.userEmail"  :disabled="action == 'edit'">
                    <template #append>@jason.com</template>
                    </el-input>

                </el-form-item>
                <el-form-item prop="mobile" label="手机号">
                    <el-input placeholder="请输入手机号" v-model="userForm.mobile" />
                </el-form-item>
                <el-form-item prop="job" label="岗位">
                    <el-input placeholder="请输入岗位" v-model="userForm.job" />
                </el-form-item>
                <el-form-item prop="state" label="状态">
                    <el-select v-model="userForm.state">
                        <el-option :value="1" label="在职"></el-option>
                        <el-option :value="2" label="离职"></el-option>
                        <el-option :value="3" label="试用期"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="roleList" label="系统角色">
                    <el-select 
                    v-model="userForm.roleList" 
                    placeholder="请选择用户系统角色"
                    multiple
                    style="width: 100%">
                        <el-option 
                        v-for="role in roleList" 
                        :key="role._id" 
                        :value="role._id"
                        :label="role.roleName"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="deptId" label="部门">
                  <!--级联-->
                       <el-cascader
                          v-model="userForm.deptId"
                          placeholder="请选择所属部门"
                          :options="deptList"
                          :props="{checkStrictly:true, value:'_id', label:'deptName'}"
                          clearable/>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleClose">取消</el-button>
                    <el-button type="primary" @click="handleSubmit">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>
<script>
import { onMounted, getCurrentInstance, reactive, ref,toRaw } from 'vue';
import utils from "../utils/utils";

export default {
    name: 'User',

    setup() {

        const checkedUserIds = ref([]);
        // 多选
        const handleSelectionChange = (list) => {
            let arr = [];
            // 遍历 
            list.map((item) => {
                arr.push(item.userId);
            });
            checkedUserIds.value = arr;
        };
        // 批量删除
        const handlePatchDelete = async () => {
            // 如果多选框的数量是0
            if (checkedUserIds.value.length == 0) {
                // 提示选择要删除的用户
                proxy.$message.error("请选择要删除的用户");
                return;
            }
            // 用proxy调用接口
            const res = await proxy.$api.userDelete({
                userId: checkedUserIds.value,
            });
            if (res.modifiedCount > 0) {
                proxy.$message.success('删除成功');
                getUserlist();
            } else {
                proxy.$message.error("删除失败")
            }
        };
        const handelDelete = async (row) => {
            const res = await proxy.$api.userDelete({
                userIds: [row.userId]
            });
            console.log(res)
            if (res.modifiedCount > 0) {
                proxy.$message.success('删除成功');
                getUserlist();
            } else {
                proxy.$message.error('删除失败')
            }
        };
        const handleCurrentChange = (current) => {
            pager.pageNum = current;
            console.log(pager.pageNum)
            getUserlist();
        };
        const handleQuery = () => {
            getUserlist();
        };
        const handleReset = (form) => {
            proxy.$refs[form].resetFields();
        };
        const { proxy } = getCurrentInstance();
        const getUserlist = async () => {
            let params = { ...user, ...pager };
            const { page, list } = await proxy.$api.userList(params) //params
            console.log(list)
            userList.value = list;
            pager.total = page.total;
        };
        onMounted(() => {
            getUserlist();
            getDeptList();
            getRoleList();
        });
        const user = reactive({
            state: "0",
        });
        const pager = reactive({
            pageNum: 1,
            pageSize: 10,
            total: 30,
        });
        const userList = ref([]);
        const columns = reactive([
            {
                label: "用户ID",
                prop: "userId",
            },
            {
                label: "用户名",
                prop: "userName",
            },
            {
                label: "用户邮箱",
                prop: "userEmail",
            },
            {
                label: "用户角色",
                prop: "role",
                formatter(row, column, value) {
                    return {
                        0: "管理员",
                        1: "普通用户",
                    }[value];
                }
            },
            {
                label: "用户状态",
                prop: "state",
                // formate方法
                formatter(row, column, value) {
                    return {
                        1: "在职",
                        2: "离职",
                        3: "试用期",
                    }[value];
                }
            },
            {
                label: " 注册时间",
                prop: "createTime",
                formatter(row, column, value) {
                    return utils.formateDate(new Date(value));
                },
            },
            {
                label: "最后登录时间",
                prop: "lastLoginTime",
                formatter(row, column, value) {
                    return utils.formateDate(new Date(value));
                }
            },

        ]);
        const showModal = ref(false);
        // 新增事件
        const handleCreate = () => {

            action.value = 'add'; // 解决不能修改表单
            showModal.value = true;
        };
        const userForm = reactive({
            state: 1,
        });
        const handleClose = () => {
            showModal.value = false;
            handleReset("dialogForm");
        };
        const action = ref("add");
        const handleSubmit = () => {
            proxy.$refs.dialogForm.validate(async (valid) => {
                if (valid) {
                    // toRaw 双向绑定对象编程普通对象
                    let params = toRaw(userForm);
                    params.userEmail += "@jason.com";
                    params.action = action.value;
                    // 接口请求数据
                    let res = await proxy.$api.userSubmit(params);
                    if (res) {
                        // 关闭模态框
                        showModal.value = false;
                        if (action.value == 'add') {
                            proxy.$message.success("新增用户成功");
                        } else {
                            proxy.$message.success("编辑用户成功");
                        }
                        handleReset("dialogForm");
                        getUserlist();
                    }
                }
            })
        };
        const handleEdit = (row) => {
            // 编辑不允许修改用户名
            action.value = "edit";
            showModal.value = true;
            proxy.$nextTick(() => {
                row.state = Number(row.state);
                // 浅拷贝
                Object.assign(userForm, row);
            })
        };
        const handleCloseDialog = () => {};
        // 模态框表单验证规则
        const rules = reactive({
            userName: [
                {
                    required: true,
                    message: "请输入用户名称",
                    trigger: "blur",
                },
            ],
            userEmail: [
                {
                    required: true,
                    message: "请输入邮箱",
                    trigger: "blur",
                },
            ],
            deptId: [
                {
                    required: true,
                    message:"请选择部门",
                    trigger: 'blur',
                }
            ],
            mobile: [
                {
                    pattern: /1[3-9]\d{9}/,
                    message:"请输入正确的手机号格式",
                    trigger: "blur"
                }
            ]
        })
        const roleList = ref([]);
        const getRoleList = async () => {
            const res = await proxy.$api.getRoleList();
            console.log(res)
            roleList.value = res;
        };
        const deptList = ref([]);
        const getDeptList = async () => {
            const list = await proxy.$api.getDeptList();
            deptList.value = list;
        };

    
        return {
            pager,
            user,
            userList,
            columns,
            getUserlist,
            handleQuery,
            handleReset,
            handleCurrentChange,
            handelDelete,
            handlePatchDelete,
            checkedUserIds,
            handleSelectionChange,
            handleCreate,
            handleSubmit,
            handleClose,
            handleCloseDialog,
            handleEdit,
            showModal,
            userForm,
            getRoleList,
            getDeptList,
            rules,
            roleList,
            deptList,
            action,
            getUserlist 
        }
    }


}
</script>