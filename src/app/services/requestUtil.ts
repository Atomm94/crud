import * as request from 'request'

export async function getRequest<T> (link:string) {
    return new Promise<T>((resolve, reject) => {
        const headers = {}
        request.get(link, headers, (err, _res, body) => {
            if (err) {
                console.error(err)
                reject(err)
            } else {
                if (_res.statusCode !== 200) {
                    console.error(888888888888888)
                    return reject(body)
                }
                return resolve(JSON.parse(body))
            }
        })
    })
}

export function postBodyRequest<T> (link:string, body:object|string, headers?:object) {
    if (!headers) {
        headers = {
           'Content-Type': 'application/json'
       }
   }
    return new Promise<T>((resolve, reject) => {
        request.post(
            {
                headers,
                uri: link,
                body: body,
                method: 'POST',
                json: true
            },
            // tslint:disable-next-line:variable-name
            (err, _res, body) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    if (_res.statusCode !== 200) {
                        console.error(body)
                        return reject(body)
                    }
                    // if (body && !body.length) return resolve()
                    // const resp = JSON.parse(body)
                    return resolve(body)
                }
            }
        )
    })
}

export function postBodyRequestForToken<T> (link:string, body:object|string, headers?:object) {
    if (!headers) {
         headers = {
            'Content-Type': 'multipart/form-data'
        }
    }

    return new Promise<T>((resolve, reject) => {
        request.post(
            {
                headers,
                uri: link,
                form: body,
                method: 'POST'
            },
            // tslint:disable-next-line:variable-name
            (err, _res, body) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    if (_res.statusCode !== 200) {
                        console.error(body)
                        return reject(body)
                    }
                    // if (body && !body.length) return resolve()
                    // const resp = JSON.parse(body)
                    return resolve(body)
                }
            }
        )
    })
}

export function putBodyRequest<T> (link:string, body:object) {
    const headers = {
        'Content-Type': 'application/json'
    }

    return new Promise<T>((resolve, reject) => {
        request.put(
            {
                headers,
                uri: link,
                body: body,
                method: 'PUT',
                json: true
            },
            // tslint:disable-next-line:variable-name
            (err, _res, body) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    if (_res.statusCode !== 200) {
                        console.error(body)
                        return reject(body)
                    }
                    if (body && !body.length) return resolve()
                    // const resp = JSON.parse(body)
                    return resolve(body)
                }
            }
        )
    })
}
