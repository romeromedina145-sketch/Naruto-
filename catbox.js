import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'

export async function uploadToCatbox(filePath) {
    const form = new FormData()

    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', fs.createReadStream(filePath))

    const { data } = await axios.post(
        'https://catbox.moe/user/api.php',
        form,
        {
            headers: form.getHeaders()
        }
    )

    return data
}
