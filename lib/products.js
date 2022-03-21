import axios from 'axios'
import ecommerceEvent from './ortto'

const get_products = async (page) => {

    const response = await axios.get(`https://api.bigcommerce.com/stores/${process.env.NEXT_PUBLIC_BC_STORE_ID}/v3/catalog/products/?include=primary_image,variants&limit=10&page=${page}`, {
        headers: {
            "Accept": "application/json",
            "X-Auth-Token": process.env.NEXT_PUBLIC_BC_AUTH_TOKEN
        }
    })

    return response.data
}

const syncProducts = async () => {

    let allProducts = []
    let i=1
    while(true){
        const products = await get_products(i)
        if (products.data.length === 0){
            break
        }
        allProducts = [...allProducts, ...products.data]
        i++
    }

    const ap = allProducts.map(product=>{

        const event = {
			resource: "product",
			event: "created",
			data_source_id: process.env.NEXT_PUBLIC_AP_DATA_SOURCE_ID,
			data: {
                id: product.id.toString(),
                name: product.name,
                url: `${process.env.NEXT_PUBLIC_BC_STORE_DOMAIN}product.custom_url.url`,
                description: product.description,
                sku: product.sku,
                stock_quantity: product.inventory_level,
                price: product.calculated_price,
                categories: product.categories,
                image_url: product.primary_image?.url_standard,
                created_at: product.date_created,
                updated_at: product.date_modified
            }
        }

        if (product.sale_price > 0 ){
            event.regular_price = product.price
        }

        return event

    })

    const result = await ecommerceEvent(ap)

}

export default syncProducts
