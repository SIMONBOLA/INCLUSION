import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import BlogForm from './BlogForm'
import { vi } from 'vitest'

test('renders blog title and author but not url or likes by default', () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'author',
    url: 'www.ejemplo.com',
    likes: 10,
    user: { username: 'testuser', name: 'Test User' },
  }

  render(<Blog blog={blog} user={{ username: 'testuser' }} />)

  // Se muestran título y autor
  const summary = screen.getByTestId('blog-summary')
  expect(summary).toHaveTextContent('Component testing is done with react-testing-library')
  expect(summary).toHaveTextContent('author')

  // No se deben mostrar ni la URL ni los likes aún
  expect(screen.queryByText(/www\.ejemplo\.com/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/likes/i)).not.toBeInTheDocument()
})

test('shows url and number of likes when view button is clicked', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'author',
    url: 'www.ejemplo.com',
    likes: 10,
    user: { username: 'testuser', name: 'Test User' },
  }

  const user = userEvent.setup()
  render(<Blog blog={blog} user={{ username: 'testuser' }} />)

  // Clic en el botón "view"
  const viewButton = screen.getByText('view')
  await user.click(viewButton)

  // Verificar que ahora aparecen la URL y los likes
  expect(screen.getByText('Trailer')).toBeInTheDocument()
  expect(screen.getByText(/likes: 10/i)).toBeInTheDocument()
})

test('calls the like button event handler twice when clicked twice', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'author',
    url: 'www.ejemplo.com',
    likes: 10,
    user: { username: 'testuser', name: 'Test User' },
  }

  const mockUpdateBlog = vi.fn()
  const mockDeleteBlog = vi.fn()

  const user = userEvent.setup()
  render(
    <Blog
      blog={blog}
      updateBlog={mockUpdateBlog}
      deleteBlog={mockDeleteBlog}
      user={{ username: 'testuser' }}
    />
  )

  // Mostrar detalles (botón "view")
  await user.click(screen.getByText('view'))

  // Clic dos veces en el botón "like"
  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)

  // Verifica que la función fue llamada 2 veces
  expect(mockUpdateBlog).toHaveBeenCalledTimes(2)
})

test('calls createBlog with correct details when a new blog is created', async () => {
  const mockCreateBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={mockCreateBlog} />)

  // Llena los campos del formulario
  await user.type(screen.getByLabelText('Title'), 'My new blog')
  await user.type(screen.getByLabelText('Author'), 'John Doe')
  await user.type(screen.getByLabelText('Url'), 'http://newblog.com')  // ojo que 'Url' con mayúscula y sin 'L' mayúscula


  // Envía el formulario (asumiendo que el botón tiene texto 'Create' o similar)
  await user.click(screen.getByText('create'))

  // Verifica que se haya llamado una vez con los datos correctos
  expect(mockCreateBlog).toHaveBeenCalledTimes(1)
  expect(mockCreateBlog.mock.calls[0][0]).toEqual({
    title: 'My new blog',
    author: 'John Doe',
    url: 'http://newblog.com',
  })

})
