import mongoose, { Mongoose } from "mongoose";

//Single CRUD permissions schema
const permissionSchema = new mongoose.Schema({
    view:{
        type:Boolean,
        default:false
    },
    create:{
        type:Boolean,
        default:false
    },
    edit:{
        type:Boolean,
        default:false
    },
    delete: {
        type: Boolean,
        default: false
    }
},{ _id: false })

const roleSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    permissions:{
        dashboard: {
            type: permissionSchema,
            default: () => ({})
        },
        userManagement: {
            type: permissionSchema,
            default: () => ({})
        },
        roleManagement: {
            type: permissionSchema,
            default: () => ({})
        },
        reports: {
            type: permissionSchema,
            default: () => ({})
        },
        settings: {
            type: permissionSchema,
            default: () => ({})
        },
        myProfile: {
            type: permissionSchema,
            default: () => ({
                view: true,
                create: false,
                edit: true,
                delete: false
            })
        }
    }
},{ timestamps:true })


const Role = mongoose.model("Role",roleSchema)
export default Role