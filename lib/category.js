import axios from 'axios'
import ecommerceEvent from './ortto'

const get_categories = async (page) => {

    const response = await axios.get(`https://api.bigcommerce.com/stores/${process.env.BC_STORE_ID}/v3/catalog/categories/?limit=20&page=${page}`, {
        headers: {
            "Accept": "application/json",
            "X-Auth-Token": process.env.BC_AUTH_TOKEN
        }
    })

    return response.data
}

const get_product_count = async (category_id) => {

    const response = await axios.get(`https://api.bigcommerce.com/stores/${process.env.BC_STORE_ID}/v3/catalog/products?categories:in=${category_id}&limit=1`, {
        headers: {
            "Accept": "application/json",
            "X-Auth-Token": process.env.BC_AUTH_TOKEN
        }
    })

    return response.data.meta.pagination.total
}

const syncCategories = async () => {

    let allCategories = []
    let i=1
    while(true){
        const categories = await get_categories(i)
        if (categories.data.length === 0){
            break
        }
        allCategories = [...allCategories, ...categories.data]
        i++
    }

    const cats = await Promise.all(allCategories.map(async (category)=>{

        const product_count = await get_product_count(category.id)

        return {
			resource: "category",
			event: "created",
			data_source_id: process.env.AP_DATA_SOURCE_ID,
			data: {
				id: category.id.toString(),
				name: category.name,
				slug: category.custom_url.url,
				url: `${process.env.BC_STORE_DOMAIN}category.custom_url.url` ,
				description: category.description,
				total_products: product_count,
				image_url: category.image_url
			}
        }
    }))

    const result = await ecommerceEvent(cats)

}

export default syncCategories