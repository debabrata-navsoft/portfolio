import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      default: "",
    },

    heroGradientText: {
      type: String,
      default: "I develop frontend",
    },

    heroHeading: {
      type: String,
      default: "solutions that delight and inspire users.",
    },

    introduction: {
      type: String,
      default: "Hi, I'm Debabrata Das, a Frontend Developer.",
    },

    profileDescription: {
      type: String,
      default:
        "A passionate Angular Trainee at <strong>Navigators Software Pvt. Ltd.</strong> dedicated to creating dynamic and user-friendly web applications while continuously improving frontend development skills.",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);

// import mongoose from "mongoose";

// const profileSchema = new mongoose.Schema(
//   {
//     imageUrl: {
//       type: String,
//       default: "",
//     },

//     greeting: {
//       type: String,
//       default: "Hi, I'm",
//     },

//     firstName: {
//       type: String,
//       default: "",
//     },

//     lastName: {
//       type: String,
//       default: "",
//     },

//     role: {
//       type: String,
//       default: "",
//     },

//     profileDescription: {
//       type: String,
//       default: "",
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// export default mongoose.model("Profile", profileSchema);

// // import mongoose from "mongoose";

// // const profileSchema = new mongoose.Schema(
// //   { imageUrl: { type: String, required: true } },
// //   { timestamps: true },
// // );

// // export default mongoose.model("Profile", profileSchema);
