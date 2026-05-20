from shared.common.tests.utils import normalize_whitespace

NEXT_URL_HAR = "https://kesaseteli.dev.hel.ninja/fi"

# Real RelayState from HAR — pysaml2's opaque ID, never a URL.
# Format: [request_id]|[timestamp]|[hmac_signature]
# - request_id: id-CXP5fBFhcypIJA9bY
# - timestamp: 1778586633 (2026-05-12 11:50:33 UTC)
RELAY_STATE_LOGOUT_HAR = (
    "id-CXP5fBFhcypIJA9bY|1778586633|dcad624ca4cf9af0f69f31ad9a6dbe51231c19b9"
)

# The following constants are used to simulate real SAML (HAR) flows
# to ensure our tests validate exactly what comes over the wire.


EXPECTED_DECODED_SAML_RESPONSE_LOGOUT_HAR = normalize_whitespace("""
    <?xml version="1.0" encoding="UTF-8"?>
    <saml2p:LogoutResponse xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol"
                           Destination="https://yjdh-kesaseteli.api.dev.hel.ninja/saml2/ls/"
                           ID="_5c6cb09746cf826f3456e6fa223c6674"
                           InResponseTo="id-CXP5fBFhcypIJA9bY"
                           IssueInstant="2026-05-12T11:50:33.932Z"
                           Version="2.0">
      <saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">https://testi.apro.tunnistus.fi/idp1</saml2:Issuer>
      <saml2p:Status>
        <saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Requester">
          <saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:UnknownPrincipal"/>
        </saml2p:StatusCode>
        <saml2p:StatusMessage>An error occurred.</saml2p:StatusMessage>
      </saml2p:Status>
    </saml2p:LogoutResponse>
""").replace("> <", "><")  # Remove whitespace between tags for exact string match


EXPECTED_DECODED_SAML_RESPONSE_LOGIN_HAR = normalize_whitespace("""
    <?xml version="1.0" encoding="UTF-8"?>
    <saml2p:Response xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol"
                     Destination="https://yjdh-kesaseteli.api.dev.hel.ninja/saml2/acs/"
                     ID="_f033ca97f85b742425f319a45a9d1978"
                     InResponseTo="id-e9UUzyZ04LK7Gj0lI"
                     IssueInstant="2026-05-13T11:44:56.853Z"
                     Version="2.0">
      <saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">https://testi.apro.tunnistus.fi/idp1</saml2:Issuer>
      <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:SignedInfo>
          <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
          <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
          <ds:Reference URI="#_f033ca97f85b742425f319a45a9d1978">
            <ds:Transforms>
              <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
              <ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
            </ds:Transforms>
            <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
            <ds:DigestValue>YKehklPVE9AxFO/SaumYdZGXoy5hVwkl6SmOdYqvbg0=</ds:DigestValue>
          </ds:Reference>
        </ds:SignedInfo>
        <ds:SignatureValue>
          GaAxFjOVHuCOrukmz9fgRpMkMa9WjMuhB/nvWhmaynco6Z7LoAj1HcPMdSMMr5KOJYbBdrp7Xruq2YrHB2qc9FITW2wX0HUX4/iKrqzB+5efPCFcGJy9brBerq0b+Ibyi7FZrvaWd84KiNdEHNzbmldq0gjahFFqmG/VSxomNiqB1SCGEweI7wP9u+VXhZWXILzvayYFaZSoepvDRpMDYk6CLM8BNBUQOovKHzLKZs1prLEpkCUEBBK5cFcX5+EjgUxXfPQo7tnbqwQSY+Shc/UWMtTHtjRQzoI4TpdYctPFX8HaGBmlUkq3z+0QkvU/i4kEAWRNQpNPMwaDnisvPd5sXdjvEb9eNLl/7cJDhO1I/40/t8HlSi7CXp3ALxpGOP6kqQq+CXB6Jq5Gssl9Wl3zr6rV+Nsk/M71WaKiMj1LcxHkOdvrASufj8buXZv4J1fnXu1RPeUdBT5G5D5tjQ773orxNKmUmNto0+Bq+FkA5LX3r70K5ngIKth9Gimj
        </ds:SignatureValue>
        <ds:KeyInfo>
          <ds:X509Data>
            <ds:X509Certificate>
              MIIHHDCCBQSgAwIBAgIPAZzCQcNueQFUNSImPd7lMA0GCSqGSIb3DQEBDQUAMIGHMQswCQYDVQQG
              EwJGSTEpMCcGA1UECgwgRGlnaS0gamEgdmFlc3RvdGlldG92aXJhc3RvIFRFU1QxHzAdBgNVBAsM
              FlRlc3RpcGFsdmVsdXZhcm1lbnRlZXQxLDAqBgNVBAMMI0RWViBURVNUIFNlcnZpY2UgQ2VydGlm
              aWNhdGVzIC0gRzJSMB4XDTI2MDMwODIyMDAwMFoXDTI4MDMwODIxNTk1OVowgZsxCzAJBgNVBAYT
              AkZJMRAwDgYDVQQIDAdGSU5MQU5EMREwDwYDVQQHDAhIZWxzaW5raTEkMCIGA1UECgwbRGlnaS0g
              amEgdmFlc3RvdGlldG92aXJhc3RvMRIwEAYDVQQFEwkwMjQ1NDM3LTIxLTArBgNVBAMMJHNhbWwt
              c2lnbmluZy10ZXN0aS5hcHJvLnR1bm5pc3R1cy5maTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCC
              AYoCggGBALlPJ+yj8g5YZizxw5JThb+aO/ClCbWYqhzSkWKtVZI0u0Cc1+bFu0nntuhGOFVOwiWl
              rll83t+FveG7qR4WhapuL/Qt/swbNWeEiNd93edvyERR2/WguAbppv9uioDUYmHl08P4KkE9wF27
              yXrYjeIIe+JEZ0dfIxnHIQJ5TyQ8vMopuRzYDuXK007LlgBlUUtrWTRy0tBAw58IrdwQHkUOHj3o
              TrYFKoz5+vYofl4SPXDCnPjPbrS7V2JUAejQ0rSVNa54EI8aV8IWj2zPE+Oc8eTveCnaqDaBXRcv
              JCTI4hLvnKgZA2RUgv22DuIR2vsEu3J9BrcMLPuMiXKZ39/LLK92jUDFnRV1EyGxGiu4rwkDxvTg
              9Gbiq+19pYwiSaLkzuqHzZQrG7dvirYWmiv7jISPH6eT+jja8W6wR7GIViFNLLDsn6HLWO5cTo3p
              6WKgskykKYFzDvxQAWnLN4rBctymV+UEWhN5mg8Nshih1AcJeioAzuGAYaksbvLdXQIDAQABo4IB
              7TCCAekwHwYDVR0jBBgwFoAUNAXy2wbdMyBs4QgHx2xP8GykHnQwHQYDVR0OBBYEFIMrOyiGUuzR
              4bX4aLZU6YlJrVYSMA4GA1UdDwEB/wQEAwIGwDCB1wYDVR0gBIHPMIHMMAgGBgQAj3oBBzCBvwYK
              KoF2hAVjCoIxAjCBsDAnBggrBgEFBQcCARYbaHR0cDovL3d3dy5maW5laWQuZmkvY3BzOTkvMIGE
              BggrBgEFBQcCAjB4GnZWYXJtZW5uZXBvbGl0aWlra2Egb24gc2FhdGF2aWxsYSAtIENlcnRpZmlr
              YXRwb2xpY3kgZmlubnMgLSBDZXJ0aWZpY2F0ZSBwb2xpY3kgaXMgYXZhaWxhYmxlIGh0dHA6Ly93
              d3cuZmluZWlkLmZpL2Nwczk5MAwGA1UdEwQFMAMBAQAwOQYDVR0fBDIwMDAuoCygKoYoaHR0cDov
              L3Byb3h5LmZpbmVpZC5maS9jcmwvZHZ2dHNwMnJjLmNybDB0BggrBgEFBQcBAQRoMGYwMwYIKwYB
              BQUHMAKGJ2h0dHA6Ly9wcm94eS5maW5laWQuZmkvY2EvZHZ2dHNwMnJjLmNybDAvBggrBgEFBQcw
              AYYjaHR0cDovL29jc3B0ZXN0LmZpbmVpZC5maS9kdnZ0c3AycmMwDQYJKoZIhvcNAQENBQADggIB
              AHbHCfjQBklxPYX5EzitXtBYySF+ar/wXK9U6HsmYtJ44SsRbN8/rOVlX4sKqNt6V2bj4CYMdAHL
              X72rrXQ6aQ5eNeN8GgmCtdFlyo607RAI1xAWO3i5EH9v6Jw+55bzHwgvafU3RLD+zIgDVOKuj0l8
              l2oNTBE5Bys/O1oFGLl0xP8VRrogmOwlA+QzH2VoLz9nnaKLiAOdJ72k/ff7NPQR/VI7oDQ2UcAM
              hKV1WDRmKF+7RS0ByE6pE12HUmv9m8aXEQ0pq8O8VKiTOwtCaChexiR3Vf/gLww+fZXdsv9dchdo
              IhBCxUji0RmSdrA+V9NLXp6nSnU+E/c71b89CXsb7vCS990nleYFrGafqY7KpLLSsIfsmn5T6ndd
              kCfsoZtpIMcVXgdEbTEroTfEtbhly2M+lrEGttsCBdP5EUDydaX021ATlQ+z+PxtkjmtZCvCe4Ps
              /4t3gEqy/vb6fwJCrOBiDi4JBB6u7umVxOwG9LHaRuKS++9Fqbvo8P7pUX71ebhuJIUUIhoKrBHz
              kGmfm5S5QnDsqAUB7GG9RvvYo+/meln3HUWKA/4F2aWHAwJOq9dQ75T78BPrx4MDYAb6qU+SlfQr
              W8/sxqCUXiSZcgNa5n1qTIMSFGs1BCO1A2czemOrw0/WkMAelYRYey9+F0MO6Tpu1RPK2fxjh0Qh
            </ds:X509Certificate>
          </ds:X509Data>
        </ds:KeyInfo>
      </ds:Signature>
      <saml2p:Status>
        <saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
      </saml2p:Status>
      <saml2:EncryptedAssertion xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
        <xenc:EncryptedData xmlns:xenc="http://www.w3.org/2001/04/xmlenc#"
                            Id="_dfe89c8ef7767eefd63836db8b1f6a13"
                            Type="http://www.w3.org/2001/04/xmlenc#Element">
          <xenc:EncryptionMethod Algorithm="http://www.w3.org/2009/xmlenc11#aes128-gcm"
                                 xmlns:xenc="http://www.w3.org/2001/04/xmlenc#"/>
          <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
            <xenc:EncryptedKey Id="_5d92ae2919cf9eabf73785809f511889"
                               Recipient="https://yjdh-kesaseteli.api.dev.hel.ninja/saml2/metadata/"
                               xmlns:xenc="http://www.w3.org/2001/04/xmlenc#">
              <xenc:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p"
                                     xmlns:xenc="http://www.w3.org/2001/04/xmlenc#">
                <ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"
                                 xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/>
              </xenc:EncryptionMethod>
              <ds:KeyInfo>
                <ds:X509Data>
                  <ds:X509Certificate>
                    MIIEJTCCAw2gAwIBAgIUOGgXOHRBpiPQZIT9z7QqvreKNTgwDQYJKoZIhvcNAQELBQAwgaExCzAJ
                    BgNVBAYTAkZJMRAwDgYDVQQIDAdVdXNpbWFhMREwDwYDVQQHDAhIZWxzaW5raTEbMBkGA1UECgwS
                    SGVsc2luZ2luIGthdXB1bmtpMRAwDgYDVQQLDAdLYW5zbGlhMRcwFQYDVQQDDA5LZXNhc2V0ZWxp
                    IERFVjElMCMGCSqGSIb3DQEJARYWa2VzYXNldGVsaUBleGFtcGxlLmNvbTAeFw0yMjA2MjExMDU2
                    MTVaFw0zMjA2MTgxMDU2MTVaMIGhMQswCQYDVQQGEwJGSTEQMA4GA1UECAwHVXVzaW1hYTERMA8G
                    A1UEBwwISGVsc2lua2kxGzAZBgNVBAoMEkhlbHNpbmdpbiBrYXVwdW5raTEQMA4GA1UECwwHS2Fu
                    c2xpYTEXMBUGA1UEAwwOS2VzYXNldGVsaSBERVYxJTAjBgkqhkiG9w0BCQEWFmtlc2FzZXRlbGlA
                    ZXhhbXBsZS5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDD54QP4sQjgvykzdZX
                    xcpdixwUDZn5bxXF5Uu/nCEylJ/B6V658M7DbMIRrAQP/TnnZpBBkQbAVhQocvIDcL4XB+wgW86z
                    UxG9gWTFysbmbJTyxA8JCIPbtcrSxbiKNJpr1nj3Wvvimaszi0mP2Gi2XQVcuO7lqXIqZLe2dwey
                    PkYZJcocXmQG3CJXDVDiN9wd/yyqGwpXXZ0H3n96wN+xz0FAYNilfGMJTMWySUnUWWVLYRS9gOo0
                    seXGrNOxzQ8lNdnpduxAHaP1aM1AQUB1zEECs2hHhk5HzxTP6qQNoEimVYL6DgBXTYPZNmLaQu7I
                    J7iHblRfFCKNz9rMjTNTAgMBAAGjUzBRMB0GA1UdDgQWBBSncyFzfj4/nstaSf02RCCeGTxOUzAf
                    BgNVHSMEGDAWgBSncyFzfj4/nstaSf02RCCeGTxOUzAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3
                    DQEBCwUAA4IBAQAvIHbz8noJnDNDvU6lUMwVCD3i0P2Hp7ETcitAA9sna4Wt1Plk+bR42aCQtdc0
                    h9w9ND9qui/m1OUBvaSatZ59rtPjDjScwBhnxx9W2UD9Pij5WH4CzRDuDrD5Q8AtvRU/a9e1Q791
                    kFf7QDI96wHa7vUxXMfSCIZ+NkxXLeIeEqgVngjbfGMRjQPNwb+x3QC6mCJu78A6/K7PafbYYqvS
                    mp5BgtL+A2/3PZhbs60v140JF9GVWgCCfRi6uEDdlch8R4ucC7xxk94Gf06smLqI5nFrsIgOIVp
                    yJR+gUe1vKpRQbsIpN9yeFWqXxh5/p4rvtCvGUsoWLTRowt+Dkae
                  </ds:X509Certificate>
                </ds:X509Data>
              </ds:KeyInfo>
              <xenc:CipherData xmlns:xenc="http://www.w3.org/2001/04/xmlenc#">
                <xenc:CipherValue>Fa95elkcxmpXjqT08wM5IRLbWUKfdgo0NrvFSfy48SSPhmzwDiJI/lrCMKJtYDIBGq8luV1yjucMkoP16DygQPJp67JRfA1fflJh94Mv6eEwnrGMXl8y/W7HhcM35QPnTKBvligdxo6gk263PfBS4SWEX6TM8yfdS+1wg229pCb5MrFnDHgf5i0E6Ia8GgRQfYBtBLrYtUmXm+omvMtIwjc8nXVlGr3s+EB1pchQCWJ5X4qb5L2jJKF4o4iLl29RcW/rbeGcrEcg7vgBSOJkVcvHzZSu8XLG35H03sgxW1kJ/V3acrfFr69kM+VGSzkRyNsDC4TIHzVguNcUpg7JEQ==</xenc:CipherValue>
              </xenc:CipherData>
            </xenc:EncryptedKey>
          </ds:KeyInfo>
          <xenc:CipherData xmlns:xenc="http://www.w3.org/2001/04/xmlenc#">
            <xenc:CipherValue>x7j4CvM2Ozh97DApW0HxUvESm7yjr1OmSH2cUW1i0RidR0VwB14Vrwrsqc15HUNcJ+lx4Dj7To0mcXScFYueCe6AO3RJT0dhGXJTXODntI3ym4PsRlktd9Xq0vCu7RacD/9tJvQyUVgXAYE30smOnkZ0TSMHrCWw5WBgpgjbzXrAoPePUMHVCZ0gUuXP0b5xCbHxj0BpPoo2BaoSfOQZ/nE6k/kLMeOMnCX2i9krdXGSV1FoQpB3p5knqqOBNo5Za0s9B24enI9mMrjsTpxrH/hl24mHTOmAlT4QfjhSdBQk5WPRnEpKV1EQTlm4jIoCsKeyez1QtEHYDlcW+yqUwae1lHdv39zL3KrEwFXIye01CYceOXXtl75YyDS1h4zysk4OlBI63pRXn9cjn9HYmdeo0NMU1cGkrGsxCgaLgrHOnAq1ovEA3ENGrqCC+p5SW2WNOcGYcrAZdRjmun/Vcaynl/UrUBZ7YNBaMUsKQZLh8XFV+l09M4rNhEF2/lt3DI7V5bC0V/cmb7Ze677rvCNwrE0zUV61PH3WI+pnZhoN/lCcUp3/A84bX4T7wevwCvVSyzbt456hVBQCItGeQwtCKikJj+nFTww6sRzYKtNVlTgGVNO5cxUgSMqNx/PtvPLOP9VReHOEXgn7d91RqnhkZ5LKE0UKHXLBpc8GRyAPuPfCdAPtF1E4D2n5G5tfb4pbiGLOHm0GAVZ4+bFwoXdRc/hMOjoiHNOr4Hh5vIQyJ3gy3RNzdTJp517NwfkniAZU+N4fVDB4sXpBqMD4Y+Y+9ZQwRz9qFdF4ezo4F2y882dZectxtHiZ62+vjFZWbBox7LMKyCOxBila/vgKEvA1OF0xw0kkniPXjqVOkTcPlWpMgruIAohYy0bAmD/I5ByzOfJYKnVMtU3rDL99cbv58Yj7mj+EO5+v5xOE0Me6A6xav6HwTyiANpQEPBJtF1rP4BFcCUi510V2obHTUsUFcuhaHWaw6jzw6PtckRleflgnQKtSh00JjqsCD/zuYg7t/XMxyGl2y72SKm94luIpvurKR9u30g7bEM+SM/yLcDUeRSSP9YkwwX5sxeLG1DzZ3Vy4/7jRC1a+s+cDVmQGuaDdEl2U+glveVPSACGow/eIhA5AMkf1C2+FA4kUU9a+09ebI0Ll4FolSC12cdpjCNZ0Qn6hak7gXGz69Z9g91z78PTKi39iI4czxZjSzKuwYOTCsovPeyJrAhx+piMd2/zreTN3SE660WrwjCvjCrLx3ZRG4nTnqgNLOP+u7Y2AinJXZr45FCowUaE8pn8h28qy62I+ro0Zcqk3EchjZGYRhDd5UNqOBQC0Zc6HOXLQdC2VCZE2YMb2nEai4kEVzXgfpNLHVUU9WZMvHKNIRu7cU5aTdDBXwIiZKQYm/Ql2ji5dQJtsqG+33n3GPYUhxlPAk6LQTyGh+hTrytJ281dNIKgukA5SzczHfCHClcmAsJMMPDFjeo93TRv1xJicdnhMhR9WqBH8lV2M1P69Gxt8RpbHZysdJO+8/OZ6gy8NdUPLSu9tRDQqUts9X4orbkL4Bl0H652P8458nuqLmzdASNvJmtKxFcL0nDWuxWiIOy+hSDGaqNpo4DKbylvyY8Qp/A7aVN01bsetwtnNdoY63kig0sXXYeAxvrT4RTSD0BYgKY9jekZ9PYIBwSd1hiG29s3qRdpeNBWn1HMNdutbKfYVw8vmu5w4NXaaUDhkx2yQYrCgzwCtRMj7eTFdJzwah1xaf+VxgwD/J7Z5xq4wq5HYBlZsK409zTW8SUls+YgGZQzImFBD+hkFcxWIyn4yeopwmpNqFaOo77KRTTnuYzbQSZuju3x/orEr2q8+3iL3dU+i/XajKsyW02VKBfTKHDBb14Mzl0GmVjE0s84hkfZSlKGfwM7kQBDMRCEUryVsm2kcGED4/rbAn3oAoXQeAe2G9xgYcjPH6HoGhh1n4QMT48EKNtUOSh56l1n3pqcxopwoGCg0dZruAswEyjBWon0e10hNtCx+mwI3w5fNluj33WKzOYw5gaff0Z69d8gEG3JcaGvVacrnVfvtrJQ5a/EaHyB5neA+OWpWtCbN6BiT/XMlkJcz6nT8SQP6jEi72RzHGZi2tA1JnsQq1YLJnUWNKFFf73Y9PhyJNWfgNQrOrlh/h6qHRMKAf7OGlCw5q/VNm54pLNY02+ab7leS2ZQBtVisY7gpvdoUTmwcRnf9fbmmhbs2j7u7WfSC79ClxuRbkjYdDb35a+7hN3gZjxAhQsVFopFNkjKIC12mR6jiNmaG1m+y9RrjsQ4V04fIMmHxcbGHyvjNQ98n0Jx6gm0PXG/xswVwGglRRY0lw1yJfcx7mTKybnXsaXtYfRxpMy4hehGSW6k9nkNIsgwtTMMqbBcY2DrEtpSiBVe7r9IJQ6q2P5XGixmB4QlAz6DfzDGgCtVeMW7ncrzO9CU5uPHqKrk55Ru2fxyxpviqhPTRT3KKAyrrABdrAJxMkTdxfChdM9G8ydFisVdK615sIYAP6eWZoN5UpJbr6Zs9FX56K2H0oCJsp16LyM3TgFQmDiVDfwYJPKKCK3k81Updqi9pYWmiKx4edYMxeECxBxNMmzSXkvoI7l0R0xCDYv86qu1GSIlTtTrYtij0o6em5kmljeWnt4NPPkPATnYnB5bDOl/f/y7fumbnCmOPnNrLEK3QvcUBOUZs6AKp6ovWLy80CMOZvorUjemDgc02ZpHDwsYLdJA5UW+je7z7Zalbma/lw1QUUfrVitVBo3E0bau6zTXSWibt/nIsQbga+uH1HFrgt3IvINGmxeFC1swZiUGfoKLuoAEm58zXdO8SmxUHfv9BL58Cg7cBiAqLrrbIxKiUncOF4aZIPU1neJyuwhNLEUzj09IL5gsGtS0yzdSS3hiFyg6RLc4uuJxiwBnofp1FGHxeaJWwppqM9pTdxjB/6bdZ3UhK6LMhyi4CNtZaxHWmTb2tpCTJEFheWyJduNINsTFbzjJSsUD0viWEs97q1+uagQ0kKCWU6ceueT10hBEiiG/RoraIQVZt1SDNDKQs6akWckJv6zcOsWwLm4Sk084W06go1TnPqdzlx5UBrCvIDqtiGfL8FAnfHtY9BxjuWsNWKRqrsmv9yZto8OVMn+ph4C4LS86ANmkwg9738zhxPndS+WtTz6F4lAt+Xo+xiql09977LrN/CNxFMgss5L+jaNWBK1/E5mveBeYuQc/aTwPmAiu7+DwPge+wupjufd5AXdL3TUo5kIcrwaeYmF+E17QtvSianIZ71Xxzq0n4gky1ORRYOoYRZpmrRcu8+eH3er57nf078Qsr1rFBeUN2qNNFeKdniGBwUrGPsRqldqidiCpsKa14/uSGHwIyQG8Ag4IHvGScHu/3+Ly/hTqE6y3iLi0hYuMkPvJQayrmDav+JZMzo+RYf0Qzobv7CsjWnUSmoXsUTWZNIzVF51nKO8+7jTMgbTZzjehLrknfIM5XaaY5ymd1IWefMBfZTPm3A4VMegaqpi6HGIT070UUDHMd9/bK7qyFcoCzdogxQhRoqZU0n112xXKXnXh8E3SPn7OGiJZHAAUTqs7s3qyPOV3LOE3/18BDOXPq2K0SQH7MrMpmwq73l42ZvFJuGiRl8Wr6vgJyN0qmBfa99eu3oVZAZegNE28kjH/golaNNXXI9EtiwdZLvplTAI5O263ZVGRfApeZ8sDyDO7DNujKBiWRp35jj5PNQtleea3TJyjueZKkANA0t3lH/snQwE2Lu0OM5hAfe0kb6ZU1SK+Ovt2K06NsQygNCK1NFIXfy4wCDBKhYwXOaV22FmAhRCyl4SzzP/hdTVEmmYe/gfAILR69AQiq6lhrdvXBL+jduPlpGeq6GjLVKjmBA6GMl8TWU/zW1DSfge+Qe5AXzlKR34lbv/TxmNl/t/DAZb9R/wQOcc2EJ33j8/1aX2H9H6+Dn9zChtGhZ6Z/g3fAitMmYwgHJklUZz8Yq/J95UYF+lbD5JH9Nb6YJ6kwOpsP3lT+wzfFtNnEMk8jXoATxEQJgwqbPzVwiB9rjMr9GykIENNhNoUtunPEoMCK6OK0KVtYQbWIKemo4jJXhYnvMtw9i5NPOOOuNQ2kqqkMk4vrMamGqQpEYpSSfRpdhP8mHvoNnn4Jh8jPJVxeiarm1wiJOvba3PGVgFXkfSTtZHC0XU2Dr0jLz4v1rQ/OFTjzM66TEob+//E7MeRLot4mpGpYFc4lbIKdVFe5I/s2fokYOy7MRfjJTICAEjt5LWUBo7eGQeB9iAWGJTqP2qfFPwqCNDxxdtxVT6l/Qh3BAaPP0N9uJEsvQ44zUSDJAc9zBVz0TwXZbIJ0o0mThk6aD++ShLhnXt5qnfZQLsjH387Xb2wLEL/j0091olCPlo4ngWyc0CukiBKGQ/K8QoqpkM6W2Y0gJqyzb3cYhcaS9jMOjqPHiCxfBxMma6xyY7ozNXYkCGKXLhl86nzHzTgg/G8AZlQBKXYelMeI3WJwDz5sSCj5sSXXPpW/uT8onBVzy0HShWwoVQGiId2Zmjqalz7gw0PsjvxGD1O4kVdES5KS3DiAH3G5hK9ofckTpd3CsKy9PMdD9qwesgixdW0QTINCKBN/Y7vS38eLwTVnlPUJ1jqBHCgLOtFVe2m+pJuUgNPn1nsdJYjSKMzECi/jddwdwBPyhfKTSOuHYGzpWryKwXgWyFwG8/Jh6GSY8xJDyAcVVe6mpEiFUwgB+u4Orprfh8JhD7msmXoBj+yYnZyEwV5fmO+7+N4ng1p44tCmhzYro7yzljiwzwqvaFbw/zxm/xcCkASpphUuiDm1KkddfJlFCEDfZw+6h1pqxSu+Y9/2FnMiNhUmG7jduP9wJRvY1Bj7635XoOEaXRa6Sxu52VZXFnrxYE04fB+2CLzxZ7EBB9ZHrWVvef4WRnGKU3P3T5LCo0FZ4VWro5sjuoEw9P2YQMjy3xYAH6YcmLRxooUHbn8DmYh2rc3eDMPeR7Acs7ZQ/1krHflk28XcvK1OeRvHzXtnGiG/irFFmS+Wtta8Yy5lQ7QsGDM6uSVY37zl7pZnbw64Brui6dpSdTDb3T+0DPBH9xtHhy7nZc3qkXr76qidadThT/tg9VRRIcKeS+dSU+xk8TXzR5jS+TkENSjO2oyMiG2Kux0jDra/HxTB72fA0q60QOpTHf4op9alQJfTrwesoTtmsm9cx4y+SAkYyRsoXAT+udI2FkovQ0AYTMXgWDxwHy4PTqzcBLIqqvQOCfvc9CUBEXT3lw8XXPGEpQalJ1C7aPw5vPSzEqeqpgwXH+TUgAayApQ9lp+yNU0vLRKSQzNdecLvhBY3pGMQ7aEYMoNoNu8qOyumE39No9tVVcuISMZN3lyf9Oalehk7x2V9Y20SMMjOUroO4Anaa5+KeXWyu5yW+MQTpygWWv5L/gcIi4UdU7ESXzJ04htkwXmLutvrDY+l2EK5+7oWIO8tMsBNCGlfVaSHsI7tknnXa6IVVbuYHvC1edA+GC+7Ma9ebT4b2LpSgxaf3juxSUHJvDiNDg7KY7t8DU4iOmELX3aHdiHsGNDnZL/YGQxGxFxAe+Q5BTS7uCiIvo+JWL51fTQrftGm2pKScMJbJLQTKMt1TfjubRPvfTqyABzqwls8gldHq1JYrzFCZVISSCwV55vVXfsWhyI/sZRnxvjs026gUm24yAf6w+t48iIJ56ZaBODAmnplWQqMCXN3QKdckqTsCxGXT9GLKIxgH7fwfzQNFm4STJHwqrDhpIwQj5NoFfH1IortPz8V0sQQU7sLSwmBOEq8peU7Ex3fUbqHokt2Oqt57KNy4nWi5x+AR9x8ONWjwviHifTcf5xzNFud/ykoHYq+pykSsw3CE409nDObO1erfMnUxHS1rzEVHvzyoVR0ftJ5bUE7ztzK4TGbS5SQRCPlwfBsUyPgXc+6nm3wHX3FP9EJiYXBd6iHRBLj8uXPpz4DLswvKQnKAX83WFlda1DH7ouG/J6LMtncr0dtj3Khl0ihQLQA3qkfcYWtrKt0JZO5MgSMrfW0BsCu3eoxJgA5FIsmRHhz8Gs4Ly9EZ4yhwf3mBDl3NwLo/zCvqNsi5zd7nokyWfd1i8sQxNCvzYrsfgrqEZsCLaycTzy6Bt1IkHRUdALX5B/w9/l93B7a5F5mO1ODwYw1slCyKl8UdbxpobAsX9o9GCfDxhJs4Csvnjucnpg3j5NgLJU1w9uNKVxFcq2T0ODWIbwn1awyGQOSM07K3+rDVMGMrf9crL3VdtW8yZLnqrvVs5n5ThdEN5w+IY/GyoGW+2ZLmVjdSqQkR7+THQzKm1Bir4ZS/h7yZvbMqBFgZkYMhHKWInf/xXxMP+Fh7W1Ys+OPS78jpKhr9IA5vNj/uiKCk9iWsGbsLqF6URzG6Sf0mKJF967pqcloUSCpEca1kUvZrQ3SqrC85MGWuXSsX5o4xijsHS6IcFoNHRzEgl/8Qw0KYHaeh9Xc7kJuLUepcOBI5KfXtL400jqusx1JHi7RJOIRIEpMx/4pT1VfXGubwyrRA2618Fz0ZN4RkeUYeJEP3CsQPQVNud9yXRR/Lt7Jmf4Q6eqRb3L3xVejlTAS6ULsMmPjZGCfcMWZU/zfhttgt8PHaIKvb0seUVPS0vKg0o46tQ9FcTfpDBBl38QnP44FWY1cHp19qkIjuKmt9dORzeS+8GU/u3+VGJ+fLFA8mOWJmd8tmZidMsecNhnZKC3bWezvYEskyOdHR4cYrwQcCwht3odLAV3A2JQxoFC23EvV8rPJVJ/T4vtTg6as0EBt/1MlM6wFhoP/3VgHwceuUV4sVjxUJBV+pMlqTXmpyW0hwCgj83TH1q5W2hcCRnoVBCZ8WqSxfqXmE4rEEytp5vIagxtoDxYDpQDz+GHohHYyg4bnjjb/6GmYXcecNbYGNWDC0TP2VtdPuYluCy6kV/aL/gIljg75h/Cx6QX91+GlaW+YjRUZEQuHTgg9MDtD8a5yKL8Jmh7OslXnny6OeHlmDyNXydgTFH2zuXljimwvajSru+PrOOPXM5bW6BfLqmuwqrhk4287+p8ZDMPtCrMPTjXox0lfN7IoGrmNFbF9FIDdtn60d54pEPKo9ndq/owWt8UBNRcqyioWeHsUxHIReayxAPizDadc56lj/u4gisJ8xmzOS6x+LGEBfbwur6zbt8+e37UPGaNYs/BlVUpJjruDC1CmrvwM/QWHrvMsPFif5kOpp1fUsd1Iv6BMbUAou8/lvvU701UmtfhXXAmqQ7oOeO7QSL1ryFb+tjL35CPXD89+mc9b2tnBHvOr+MaRAMCsYjHRl8fqvyCzYW1H0lx0ggyGv05thf/rknUWXjghiXUCBXOYeVUupY2MbMIMFY6yEIUEhvXbK9EqSw3mCekBf24gEzZqcDaLZBhIDG4V9FfTP0Pk4WJ98DRaNeGDgiMAsoF4kSQzZPXzEd3Afp34LhO1xFV/LPCf/tXLyX19mf9EYLY66ToauueCFU4dGFlv1ngvTw4/OzFnpToufDTqO50orJQRHG2qUonh6wCYxFGp31WlycyIg8LN00/qtaGghsJ952QRu0bA2FqsdrdHxTLqbJYOkws0FjcsZB8oBIg1iBiDUMMDhGguxEEiy/ztShjG4TIVmLXZzrXGE+u8tFu+LxSqqrJ2HVc2cAUDGBYoScfqKd7S+VqTLNUL/9HOutCrGH/IxvCEX/N+VSGNu1Lmk+5Tmm51uHhb+ZEwkn6xBykqieBI7pPiZrMz36AAin3dLqz1fsvwpWdd8wIuB6/PfD6k6B4rMaiTnY+N40vxqumO3OXZjAnfkFyqPRjkwLxikAN2We5uCj5XbjD5oBhWtQ6H9XY+N40vxqumO3OXZjAnfkFyqPRjkwLxikAN2We5uCj5XbjD5oBhWtQ6H9yn5cLkQuDUsvsHWHobpHShUydXHl5YPvwAOD/Y7T7QnH0n+6qjaJEnrSda1+B4dPfAhKKLkJZjEfrPI88JJnUEJKTtxFqqPyqUAvYrsUbhSN4WJew2G7bqPoGbCGIZZl3/L2XHpLiJ/I1hmlZzYUctRXzjgsGI4leohAhgfyWLRpCKc2m4c0Cds4Z6Og5AAQSqD/LNdwb1tGw7eth2zfucckjOrclfDTsYxrv6BFl2j2UzMd14iUj+T0YpvaId3kFd9jVKi6qMm130rRUvdkjZXFafT0eRQ4dvWtuS8Yqu6bpiVdUnChh2hK4SJF9/BQxPCdpLqeXzpDFoiMvwpWoDmrAdECAWwOG0ex/U8KgXvGqYnD7NCkRwMVhsSBYgylwx3xoaQWCRGpInkserZRD2hyODitcpbwX+HxIvgkfeL9lVs66pw6fTJJLvlUPVjdVUiQ1FgzRsk5B0B1m+LLRY893mpRyE1k0EoGoXnGx6UZyBiPbYuXlKsbPMzsDKB/aLGxQYgWx3kTnNHHFJ8EG7niDOtcssjvu15esc7nw3nmA7JO/ZMg5ohobC7RhSlxYc53Iokh8iTmu5la7MqHASdS97B4Uh+GGjSgcJoRgI44G06pEfDyuIbPt9aD5pK1mgrt+F5lq6862iy864Hc7EKR01FTILJAeVg+kWE8NSsXc/ibOV8e21zWRW9tiIx947KMg8FXqqCjXvhKpgV0OXkr7dZSdZ8wf78r78sLEYugoOqoKCwihq6KzbBBOZRbWc1f6jCK4/CNWw3k7HMAqIHamwDF9SSYeLxrt9DYD+eMiRPpkN1hBrjovwjK9lmrEWWJmoePDP+woacX3GhAhjkljLbpCvUE98xBx+A+xZvhaADn4+CKGrGFqesbFLrBG+CrkVGb4VbDnbpYQeoUsqGPAVbFbn0/gsS3sdT63OmYMkwfOwY0QoBk13evRf1lxHG53IPa7fqoax5MdYxPke4kjPCxowKOy2zhNW1D0ModNGmw6N3e1VSIKEKqY3d+1bhCFi3tKfWXi6c/AfaKBzg7SfG4bmrKMdgHBqemTqhlCWX0q5tZyhMZGrZ3Z+VW56MS+wL/B6aQPK0wfrmyvK2vOtRsOXR8Q67/qW+tlHdTesMnc4eQgCCN+DybOAIp1J4c3n/UnnrGP5bCnXYrf+zUxOCoDWwPOJk7gWb1+PXeTv/ijrVd8DjDZC66ACszJ6h95q7ADDKV/vPRobCFclgQHsiZrubmnfc+FUM4vIw8Yxql3nc+0/GhN/QJ/FlYmDB5pl/ya7ppg+dnswyFjiZtE2IWqIaIe9RdNhXB2v7BI1swIYJlG+siV4N0YXwIEyzYjtTWN4+cCC37eUB85o7ywDQazwuC8cY3Zjp9nE2m3JG2aMnMZfYuQCe1w9LtV+zKgJzAyovswLyE8YSXjNtPFvOjkDlPcdzSVVMrz1vsRCxPBQdFtE6LfkIUhZUx1J2LF8ImsFt1ThWFI7jRH7fnpBPfltxEFJx74lMivlTTSw1MbCMy0jDgVatclDtJ+QylxlqA3jFRVqJW1PSfTgKW2c/4QcVa6yw2gqm01M=
                  </ds:X509Certificate>
                </ds:X509Data>
              </ds:KeyInfo>
              <xenc:CipherData xmlns:xenc="http://www.w3.org/2001/04/xmlenc#">
                <xenc:CipherValue>Fa95elkcxmpXjqT08wM5IRLbWUKfdgo0NrvFSfy48SSPhmzwDiJI/lrCMKJtYDIBGq8luV1yjucMkoP16DygQPJp67JRfA1fflJh94Mv6eEwnrGMXl8y/W7HhcM35QPnTKBvligdxo6gk263PfBS4SWEX6TM8yfdS+1wg229pCb5MrFnDHgf5i0E6Ia8GgRQfYBtBLrYtUmXm+omvMtIwjc8nXVlGr3s+EB1pchQCWJ5X4qb5L2jJKF4o4iLl29RcW/rbeGcrEcg7vgBSOJkVcvHzZSu8XLG35H03sgxW1kJ/V3acrfFr69kM+VGSzkRyNsDC4TIHzVguNcUpg7JEQ==</xenc:CipherValue>
              </xenc:CipherData>
            </xenc:EncryptedKey>
          </ds:KeyInfo>
          <xenc:CipherData xmlns:xenc="http://www.w3.org/2001/04/xmlenc#">
            <xenc:CipherValue>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|id-e9UUzyZ04LK7Gj0lI|1a646c646c646c646c646c646c646c646c646c646c"
""").replace("> <", "><")  # Remove whitespace between tags for exact string match
