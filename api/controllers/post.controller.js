import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
export const getPosts = async (req, res) => {
  const query = req.query;
  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || undefined,
          lte: parseInt(query.maxPrice) || undefined,
        },
      },
    });
    res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  // console.log(req.cookies);
  // return;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            avatar: true,
            username: true,
          },
        },
        postDetail: true,
      },
    });
    console.log("post: ", JSON.stringify(post, null, 2));
    res.status(200).json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }

  //   const token = req.cookies?.token;

  //   if (token) {
  //     jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
  //       if (!err) {
  //         const saved = await prisma.savedPost.findUnique({
  //           where: {
  //             userId_postId: {
  //               postId: id,
  //               userId: payload.id,
  //             },
  //           },
  //         });
  //         res.status(200).json({ ...post, isSaved: saved ? true : false });
  //       }
  //     });
  //   }
  //   res.status(200).json({ ...post, isSaved: false });
  // } catch (err) {
  //   console.log(err);
  //   res.status(500).json({ message: "Failed to get post" });
  // }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;
  console.log("tokenUserId", tokenUserId);
  console.log(JSON.stringify(body, null, 2));

  const myUser = await prisma.user.findUnique({
    where: { id: tokenUserId },
  });
  const userDetails = {
    username: myUser.username,
    avatar: myUser.avatar,
  };
  console.log("user: ", JSON.stringify(myUser, null, 2));
  console.log("userDetails: ", JSON.stringify(userDetails, null, 2));

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    console.log(newPost);
    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add post" });
  }
};

export const updatePost = async (req, res) => {
  try {
    res.status(200).json();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  console.log("tokenUserId", tokenUserId);
  console.log("id", id);
  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (post.userId !== tokenUserId) {
      return res
        .status(403)
        .json({ message: "You can't delete other users posts" });
    }
    await prisma.post.delete({ where: { id } });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};
