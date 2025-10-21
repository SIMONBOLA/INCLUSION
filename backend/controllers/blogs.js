const express = require('express');
const { createBlog, findAllBlogs, findBlogById } = require('../models/blog');
const { userExtractor } = require('../utils/middleware');
const blogsRouter = express.Router();

blogsRouter.get('/', async (req, res) => {
  try {
    const blogs = await findAllBlogs();
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

blogsRouter.post('/', userExtractor, async (req, res) => {
  const { title, content } = req.body;
  const user = req.user;

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  try {
    const newBlog = await createBlog({ title, content, userId: user.id });
    res.status(201).json(newBlog);
  } catch (error) {
    console.error('Error creating blog:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

blogsRouter.delete('/:id', userExtractor, async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const blog = await findBlogById(id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.user_id !== user.id) {
      return res.status(403).json({ error: 'Only the creator can delete the blog' });
    }

    await db.query('DELETE FROM blogs WHERE id = $1', [id]);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting blog:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = blogsRouter;
