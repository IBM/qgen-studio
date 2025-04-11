'use client';

import { Button, Heading, Section } from "@carbon/react";
import { ArrowRight } from "@carbon/icons-react";
import "./_main-page.scss";

export default function Home() {
  return (
    <>
      <Heading><strong>QGen Studio</strong></Heading>
      <Section style={{marginBottom: "3rem"}}>
        <Heading style={{textAlign: "center"}}>An Adaptive Question-Answer <br/>Generation, Training and Evaluation Platform</Heading>
      </Section>
      <Button href="/doc_groups" renderIcon={ArrowRight}>Get Started</Button>
    </>
  );
}
