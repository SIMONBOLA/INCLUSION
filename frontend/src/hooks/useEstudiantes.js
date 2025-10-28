import { useState, useEffect, useCallback, useRef } from 'react'
import estudiantesService from '../services/estudiantes'

/**
 * Hook personalizado para manejar la lista de estudiantes
 * @param {Object} options Opciones de configuración
 * @param {boolean} options.autoLoad Cargar estudiantes automáticamente
 * @param {number} options.refreshInterval Intervalo de actualización en ms (0 para deshabilitar)
 * @param {boolean} options.useMockOnError Usar datos mock si hay error (default: true)
 * @returns {Object} Estado y funciones para manejar estudiantes
 */
const useEstudiantes = ({ 
  autoLoad = true, 
  refreshInterval = 0,
  useMockOnError = true 
} = {}) => {
  const [estudiantes, setEstudiantes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const mounted = useRef(false)
  const loadingRef = useRef(false)

  const cargarEstudiantes = useCallback(async (silencioso = false) => {
    // Evitar cargas múltiples simultáneas
    if (loadingRef.current) return
    
    if (!silencioso) {
      setLoading(true)
      loadingRef.current = true
    }
    
    setError(null)

    try {
      const data = await estudiantesService.obtenerEstudiantes()
      // Solo actualizar si el componente sigue montado
      if (mounted.current) {
        setEstudiantes(Array.isArray(data) ? data : [])
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.warn('Error al cargar estudiantes:', error)
      if (mounted.current) {
        setError(error.message)
      }
    } finally {
      if (mounted.current && !silencioso) {
        setLoading(false)
        loadingRef.current = false
      }
    }
  }, [])

  const obtenerEstudiante = useCallback(async (id) => {
    if (!id) {
      console.warn('ID no proporcionado para obtenerEstudiante')
      return null
    }

    // No mostrar loading para operaciones rápidas con mock data
    const isTokenValid = window.localStorage.getItem('userToken')
    if (isTokenValid) {
      setLoading(true)
      loadingRef.current = true
    }
    
    setError(null)

    try {
      const estudiante = await estudiantesService.obtenerEstudiantePorId(id)
      if (!estudiante && mounted.current) {
        throw new Error('Estudiante no encontrado')
      }
      return estudiante
    } catch (error) {
      console.warn('Error al obtener estudiante:', error)
      if (mounted.current) {
        setError(error.message)
      }
      return null
    } finally {
      if (mounted.current && isTokenValid) {
        setLoading(false)
        loadingRef.current = false
      }
    }
  }, [])

  // Control de montaje del componente
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // Efecto para carga inicial
  useEffect(() => {
    let ignore = false

    if (autoLoad && !ignore) {
      cargarEstudiantes()
    }

    return () => {
      ignore = true
    }
  }, [autoLoad, cargarEstudiantes])

  // Efecto para actualizaciones periódicas
  useEffect(() => {
    let interval
    
    if (refreshInterval > 0 && mounted.current) {
      interval = setInterval(() => {
        if (mounted.current && !loadingRef.current) {
          cargarEstudiantes(true) // Actualización silenciosa
        }
      }, refreshInterval)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [refreshInterval, cargarEstudiantes])

  return {
    estudiantes,
    loading,
    error,
    lastUpdate,
    cargarEstudiantes,
    obtenerEstudiante,
    // Helpers para UI
    isEmpty: estudiantes.length === 0,
    isLoading: loading,
    hasError: error !== null,
    // Metadata
    isMockData: !window.localStorage.getItem('userToken')
  }
}

export default useEstudiantes