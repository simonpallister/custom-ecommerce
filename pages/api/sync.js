import syncCategories from "../../lib/category"
import syncCustomers from "../../lib/customer"
import syncOrders from "../../lib/orders"
import syncProducts from "../../lib/products"
import createWebhooks from "../../lib/webhooks"

export default async function handler(req, res) {

    res.status(200).json({ message: "Syncing started" })

    console.log("Syncing....")
    Promise.all([
        syncCategories(),
        syncCustomers(),
        syncOrders(),
        syncProducts()
        createWebhooks(),
    ]).then(
        console.log("Sync Complete")
    )

}