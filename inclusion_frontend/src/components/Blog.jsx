import { useState } from "react"

const Blog = ({ blog, updateBlog, deleteBlog, user }) => {
  const [info, setInfo] = useState(false)
  const [likes, setLikes] = useState(blog.likes)

  const handleLikes = () => {
    const newLikes = likes + 1
    setLikes(newLikes)
    updateBlog(blog.id, { likes: newLikes })
  }

  const toggleView = () => setInfo(!info)

  const handleDelete = () => {
    if (window.confirm(`Delete ${blog.title} by ${blog.author}?`)) {
      deleteBlog(blog.id)
    }
  }

  const isOwner = user?.username === blog?.user?.username

  return (
    <div className="blog">
      {!info ? (
        <div className="blog-summary" data-testid="blog-summary">
          {blog.title} by {blog.author}
          <button onClick={toggleView}>view</button>
        </div>
      ) : (
        <div className="blog-summary" data-testid="blog-summary">
          <div>
            Title: {blog.title} <button onClick={toggleView}>hide</button>
          </div>
          <div>Author: {blog.author}</div>
          <div>Url: <a href={blog.url}>Trailer</a></div>
          <div>
            Likes: {likes} <button onClick={handleLikes}>like</button>
          </div>
          <div>{blog.user.name}</div>
          {isOwner && <button onClick={handleDelete}>delete</button>}
        </div>
      )}
    </div>
  )
}

export default Blog
