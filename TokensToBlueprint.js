const signal_names = {"+": "signal-plus", "-": "signal-minus", ",": "signal-comma", ".": "signal-letter-dot", "<": "signal-less-than", ">": "signal-greater-than", "[": "signal-left-square-bracket", "]": "signal-right-square-bracket", "v": "signal-V"};

function TokensToBlueprint(tokens) {
    let entity_id = 1

    let output= {
        "blueprint": {
            "item": "blueprint",
            "version": 0,
            "entities": [
                {entity_number: entity_id++, name:"medium-electric-pole", position: {x: -1.5, y: 0.5}}
            ],
            "wires": []
        }
    }


    let x_offset = 0; let y_offset = 0;
    for (i in tokens) {
        i = parseInt(i)
        const lamp_id = entity_id++
        const cc_id = entity_id++
        const dc_id = entity_id++
        const token = tokens[i]

        const lamp = {
            "name": "small-lamp",
            "entity_number": lamp_id,
            "position": {"x": x_offset + 0.5, "y": y_offset + 0.5},
            "control_behavior": {
                "circuit_enabled": true,
                "circuit_condition": {
                    "first_signal": {"name": "signal-I", "type": "virtual"},
                    "comparator": "=",
                    "constant": i+1
                }
            }
        }
        const constant_combinator = {
            "name": "constant-combinator",
            "entity_number": cc_id,
            "position": {"x": x_offset + 0.5, "y": y_offset + 1.5},
            "direction": 4,
            "control_behavior": {"sections": {"sections": [{"filters": [
                {"count": token.value, "name": signal_names[token.type], "type": "virtual", "quality": "normal", "comparator": "=", "index":1}
            ], "index": 1}
            ]}}
        }
        const decider_combinator = {
            "name": "decider-combinator",
            "entity_number": dc_id,
            "position": {"x": x_offset + 0.5, "y": y_offset + 3},
            "direction": 4,
            "control_behavior": {
                "decider_conditions": {
                    "conditions": [
                        {
                            "comparator": "=",
                            "first_signal": {"name": "signal-I", "type": "virtual"},
                            "first_signal_networks": {"green": true, "red": false},
                            "constant": i+1
                        }
                    ],
                    "outputs": [{
                        "networks": {"green": false, "red": true},
                        "signal": {"name": "signal-everything", "type": "virtual"}
                    }]
                }
            }
        }

        output.blueprint.entities.push(lamp)
        output.blueprint.entities.push(constant_combinator)
        output.blueprint.entities.push(decider_combinator)

        output.blueprint.wires.push([cc_id,1,dc_id,1]) // Connect CC to DC
        output.blueprint.wires.push([lamp_id,2,dc_id,2]) // Connect Lamp to DC
        output.blueprint.wires.push([dc_id,2,dc_id,4]) // Connect DC to DC

        // Connect to neighbours
        if (x_offset === 0 && y_offset === 0) {
            // Very first cell, connect to pole
            output.blueprint.wires.push([lamp_id,2,1,2])
        } else if (x_offset === 0 && y_offset > 0) {
            // New row, bridge input/output lines to row above
            output.blueprint.wires.push([dc_id-(3*64),2,lamp_id,2])
        } else if (x_offset > 0) {
            // Bridge input/output lines to previous cell
            output.blueprint.wires.push([lamp_id-3,2,dc_id,2])
        }

        x_offset++

        // Wrap around to new row
        if (x_offset == 64) {
            x_offset = 0
            y_offset += 5
        }
    }

    // Add auxiliary power poles
    for (let y_offset = 0; y_offset < 21; y_offset += 5) {
        // Leading pole
        output.blueprint.entities.push({entity_number: entity_id++, name:"medium-electric-pole", position: {x: 0.5, y: y_offset - 0.5}})
        for (let x_offset = 4; x_offset < 64; x_offset += 7) {
            output.blueprint.entities.push({entity_number: entity_id++, name:"medium-electric-pole", position: {x: x_offset + 0.5, y: y_offset - 0.5}})
        }
    }

    return output
}

function InputsToBlueprint(inputs) {
    let tokens = []
    for (let input of inputs) {
        tokens.push(input)
    }
    return TokensToBlueprint(tokens)
}

function Encode(blueprint) {
    const json = JSON.stringify(blueprint)
    const result = json.replace(/(null)|(,null)/g, "").replace(/(\[,)/g, "[");
    const encoded = pako.deflate(result, { level: 9 });
    const buffer = new Uint8Array(encoded);
    return 0 + buffer.toBase64();
}
