/**
 * Telegram Webhook Handler
 * Handles incoming webhook requests from Telegram Bot API
 */

import { createResponse } from "../upload/uploadTools";

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

/**
 * Handle Telegram webhook POST requests
 */
export async function onRequestPost(context) {
    const { request } = context;

    try {
        // Parse the incoming webhook data
        const update = await request.json();
        
        // Log the update for debugging (can be removed in production)
        console.log('Received Telegram webhook:', JSON.stringify(update));

        // Telegram expects a 200 OK response
        return createResponse(JSON.stringify({ ok: true }), {
            status: 200,
            headers: JSON_HEADERS
        });
    } catch (error) {
        console.error('Error processing Telegram webhook:', error);

        // Return error response
        return createResponse(JSON.stringify({
            ok: false,
            error: 'Invalid Telegram payload'
        }), {
            status: 400,
            headers: JSON_HEADERS
        });
    }
}

/**
 * Handle GET requests - return webhook info
 */
export async function onRequestGet() {
    return createResponse(JSON.stringify({
        status: 'Telegram webhook endpoint',
        method: 'POST',
        description: 'This endpoint receives webhook updates from Telegram Bot API'
    }), {
        status: 200,
        headers: JSON_HEADERS
    });
}

/**
 * Handle OPTIONS requests for CORS support
 */
export async function onRequestOptions() {
    return createResponse(null, { status: 204 });
}
