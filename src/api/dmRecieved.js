export default function (body) {
    const event = body.event;
    console.log(`Direct message received from user ${event.user} in channel ${event.channel}: ${event.text}`);
}
