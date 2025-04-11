'use client';

import { Button, Heading, Section, Tile, } from "@carbon/react";

import DocGroups from "@/components/DocGroups/DocGroups";

export default function Page() {
    return(
        <>
            <Heading style={{marginBottom: "1rem"}}>Document Groups</Heading>
            <Section style={{marginBottom: "2rem"}}>
                Document Groups are collections of text from which questions and answers can be generated.
            </Section>
            <Tile style={{marginBottom: "2rem"}}>
                <div>
                    <DocGroups/>
                </div>
            </Tile>
            <div style={{display: "flex", flexFlow: "row-reverse"}}>
                <Button href="/prompts">Next</Button>
            </div>
        </>
    )
}