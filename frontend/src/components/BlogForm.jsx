import { useState } from "react"

const BlogForm = ({ createBlog }) => {
    const [title, setNewTitle] = useState('')
    const [author, setNewAuthor] = useState('')
    const [url, setNewUrl] = useState('')
    const addBlog = (event) => {
        event.preventDefault()
        createBlog({
            title,
            author,
            url
        }, title, author)
        setNewTitle('')
        setNewAuthor('')
        setNewUrl('')
    }
    const handleTitleChange = (event) => {
        setNewTitle(event.target.value)
    }

    const handleAuthorChange = (event) => {
        setNewAuthor(event.target.value)
    }

    const handleUrlChange = (event) => {
        setNewUrl(event.target.value)
    }

    return (
        <div>
            <h2>create new blog</h2>
            <form name="BlogsForm" onSubmit={addBlog}>
                <div>
                    <label htmlFor="title">Title </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        autoComplete="off"
                    />
                </div>
                <div>
                    <label htmlFor="author">Author </label>
                    <input
                        id="author"
                        type="text"
                        value={author}
                        onChange={handleAuthorChange}
                        autoComplete="off"
                    />
                </div>
                <div>
                    <label htmlFor="url">Url </label>
                    <input
                        id="url"
                        type="text"
                        value={url}
                        onChange={handleUrlChange}
                        autoComplete="off"
                    />
                </div>
                <button type="submit">create</button>
            </form>
        </div>
    )
}

export default BlogForm;