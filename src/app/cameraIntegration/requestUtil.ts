import * as request from 'request'
import { config } from '../../config'

export async function getRequest<T> (link: string) {
    return new Promise<T>((resolve, reject) => {
        const headers = {}
        request.get(link, headers, (err, _res, body) => {
            if (err) {
                console.error(err)
                reject(err)
            } else {
                if (_res.statusCode !== 200) {
                    return reject(body)
                }
                return resolve(JSON.parse(body))
            }
        })
    })
}

export function postBodyRequest<T> (link: string, body: object | string, headers?: object) {
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
            (err, _res, res_body) => {
                console.log('postBodyRequest', link, body, _res.statusCode, res_body)
                if (err) {
                    reject(err)
                } else {
                    if (![200, 201].includes(_res.statusCode)) {
                        console.error(33333, res_body)
                        if (link === config.zoho.urls.createPlanUrl && res_body.code === 100502) {
                            return resolve(res_body)
                        } else {
                            return reject(res_body)
                        }
                    }
                    // if (body && !body.length) return resolve()
                    // const resp = JSON.parse(body)

                    return resolve(res_body)
                }
            }
        )
    })
}

export function postBodyRequestForToken<T> (link: string, body: object | string, headers?: object) {
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
            (err, _res, res_body) => {
                console.log('postBodyRequestForToken', link, body, _res.statusCode, res_body)
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    if (_res.statusCode !== 200) {
                        console.error(res_body)
                        return reject(res_body)
                    }
                    // if (body && !body.length) return resolve()
                    // const resp = JSON.parse(body)
                    return resolve(res_body)
                }
            }
        )
    })
}

export function putBodyRequest<T> (link: string, body: object) {
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
export async function getRequestWIthDigestAuth<T> (url: string, device: any) {
    const username = device.username
    const password = device.password

    const options = {
        url: `http://${url}`,
        auth: {
            user: username,
            pass: password,
            sendImmediately: false,
            digestAuth: true
        }
    }
    return new Promise<T>((resolve, reject) => {
        request.get(options, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                resolve(body)
            } else {
                console.log(2231212, error)

                reject(error)
            }
        })
    })
}
