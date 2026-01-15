import { describe, it, expect, vi, beforeEach } from 'vitest'
import { pythonExecute } from 'src/api/utils.js'
import { PythonShell } from 'python-shell'

vi.mock('python-shell')
vi.mock('os', () => {
  const os = {
    platform: () => 'linux',
    tmpdir: () => '/tmp',
  }
  return {
    ...os,
    default: os,
  }
})

describe('utils.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('pythonExecute', () => {
    it('should execute python code using runString', async () => {
      const mockRes = {
        setHeader: vi.fn(),
      }
      const code = 'print("hello")'
      const args = ['arg1']
      const mockResults = ['result']

      PythonShell.runString.mockResolvedValue(mockResults)

      const result = await pythonExecute(mockRes, code, args)

      expect(PythonShell.runString).toHaveBeenCalledWith(
        code,
        expect.objectContaining({
          args: args,
          mode: 'text',
          pythonPath: expect.stringMatching(/python3?$/),
        }),
      )
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/plain',
      )
      expect(result).toBe('result')
    })

    it('should handle execution errors', async () => {
      const mockRes = {
        setHeader: vi.fn(),
      }
      const code = 'raise Exception()'
      const error = new Error('Python Error')

      PythonShell.runString.mockRejectedValue(error)

      // We need to enable debug mode for error logging in utils.js,
      // but 'debug' is a constant imported from the file based on process.argv.
      // This is hard to change at runtime.
      // However, the function catches the error and returns undefined.

      const result = await pythonExecute(mockRes, code)

      expect(PythonShell.runString).toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })
})
