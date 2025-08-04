
export default function FileUpload({ files, onFileChange }) {
  return (
    <div className="bg-white rounded-xl p-6 mb-5 shadow-lg backdrop-blur-sm">
      <h2 className="text-gray-800 mb-4 text-xl font-semibold">Upload Resumes</h2>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors hover:border-blue-500">
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.docx"
          onChange={onFileChange}
          className="hidden"
        />
        <label 
          htmlFor="file-input" 
          className="inline-block bg-gray-50 border-2 border-gray-300 px-6 py-3 rounded-lg cursor-pointer text-base transition-all hover:bg-gray-100 hover:border-blue-500"
        >
          📁 Choose PDF or DOCX files
        </label>
        {files.length > 0 && (
          <div className="mt-5 text-left">
            <h3 className="text-gray-800 mb-3 font-medium">
              Selected Files ({files.length}):
            </h3>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li 
                  key={index}
                  className="bg-gray-50 p-3 rounded border-l-4 border-blue-500 text-sm"
                >
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
