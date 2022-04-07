const axios = require('axios')
import ecommerceEvent from './ortto'


const get_orders = async (page) => {

    const response = await axios.get(`https://api.bigcommerce.com/stores/${process.env.BC_STORE_ID}/v2/orders?limit=10&page=${page}`, {
        headers: {
            "Accept": "application/json",
            "X-Auth-Token": process.env.BC_AUTH_TOKEN
        }
    })

    return response.data
}

const get_order_products = async (order_id) => {

    const response = await axios.get(`https://api.bigcommerce.com/stores/${process.env.BC_STORE_ID}/v2/orders/${order_id}/products`, {
        headers: {
            "Accept": "application/json",
            "X-Auth-Token": process.env.BC_AUTH_TOKEN
        }
    })

    return response.data
}



const syncOrders = async () => {

    let allOrders = []
    let i=1
    while(true){
        const orders = await get_orders(i)
        if (orders.length === 0){
            break
        }
        allOrders = [...allOrders, ...orders]
        i++
    }

    const ao = await Promise.all(allOrders.map(async (order)=>{

        const products = await get_order_products(order.id)

        const line_items = products.map(product=>{
            return {
                product_id: product.product_id,
                variant_id: product.variant_id,
                name: product.name,
                quantity: product.quantity,
                total_price: parseFloat(product.price_inc_tax),
                total_tax: parseFloat(product.total_tax)
            }
        })


        const event = {
			resource: "order",
			event: "created",
			data_source_id: process.env.AP_DATA_SOURCE_ID,
			customer: {
                id: order.customer_id.toString(),
                email: order.billing_address.email,
                email_marketing: true,
                phone: order.billing_address.phone,
                first_name: order.billing_address.first_name,
                last_name: order.billing_address.last_name,
                billing: {
                    first_name: order.billing_address.first_name,
                    last_name: order.billing_address.last_name,
                    address1: order.billing_address.street_1,
                    city: order.billing_address.city,
                    state: order.billing_address.state,
                    postcode: order.billing_address.zip,
                    country: order.billing_address.country
                },
                shipping: {
                    first_name: order.billing_address.first_name,
                    last_name: order.billing_address.last_name,
                    address1: order.billing_address.street_1,
                    city: order.billing_address.city,
                    state: order.billing_address.state,
                    postcode: order.billing_address.zip,
                    country: order.billing_address.country
                },
                created_at: new Date(order.date_created).toISOString(),
                updated_at: new Date(order.date_modified).toISOString()
            },
            data: {
                id: order.id.toString(),
                billing_address: {
                    first_name: order.billing_address.first_name,
                    last_name: order.billing_address.last_name,
                    address1: order.billing_address.street_1,
                    city: order.billing_address.city,
                    state: order.billing_address.state,
                    postcode: order.billing_address.zip,
                    country: order.billing_address.country
                },
                shipping_address: {
                    first_name: order.billing_address.first_name,
                    last_name: order.billing_address.last_name,
                    address1: order.billing_address.street_1,
                    city: order.billing_address.city,
                    state: order.billing_address.state,
                    postcode: order.billing_address.zip,
                    country: order.billing_address.country
                },
                currency: order.currency_code,
				total_price: parseFloat(order.total_inc_tax),
				total_tax: parseFloat(order.total_tax),
				subtotal_price: parseFloat(order.subtotal_inc_tax),
				subtotal_tax: parseFloat(order.subtotal_tax),
				discounts_total_price: parseFloat(order.discount_amount),
				shipping_total: parseFloat(order.shipping_cost_inc_tax),
				shipping_tax: parseFloat(order.shipping_cost_tax),
				payment_method: parseFloat(order.payment_method),
                line_items: line_items,
                coupon_codes: ["CODE"],
                created_at: new Date(order.date_created).toISOString(),
                updated_at: new Date(order.date_modified).toISOString()

            }
        }
        return event

    }))

    const result = await ecommerceEvent(ao)

}

export default syncOrders
