export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).send('Webhook ready. POST only.');
    }

    try {
        const event = req.body;

        if (event.event === 'charge.success' && event.data?.status === 'success') {
            const reference = event.data.reference;
            const uid = event.data.metadata?.uid;

            if (!uid) return res.status(400).send('No UID');

            // Verify with Paystack
            const check = await fetch(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: { Authorization: 'Bearer sk_live_c72257e703ee63aec11cb51076bc0866410de647' }
                }
            );
            const result = await check.json();

            if (result.data?.status === 'success') {
                // Update Firestore
                await fetch(
                    `https://firestore.googleapis.com/v1/projects/naija-marketplace-pro-d154f/databases/(default)/documents/users/${uid}`,
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fields: {
                                verified: { booleanValue: true },
                                verifiedAt: { timestampValue: new Date().toISOString() },
                                paymentReference: { stringValue: reference }
                            }
                        })
                    }
                );
            }
        }

        return res.status(200).send('OK');
    } catch (error) {
        return res.status(200).send('OK');
    }
  }
